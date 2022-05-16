const WIDTH = 8,
  HEIGHT = 8,
  WIDTH_BLOCK = 32,
  HEIGHT_BLOCK = 32;

let canvas = document.querySelector("#canvas"),
  images = Array(16)
    .fill(0)
    .map((value) => new Image());

images.forEach((value, index) => {
  images[index].src = "images/animals/" + (index + 1) + ".jpg";
});

let context = canvas.getContext("2d"),
  Ts = [],
  pixels = [],
  nn = {};

function rnd(min, max) {
  return min + Math.random() * (max - min);
}

function cArr() {
  pixels.forEach((value, indexValue) => {
    Ts.push(value.map((pixel, indexPixel) => pixel / 255));
  });
  context.clearRect(0, 0, canvas.width, canvas.height);
}

class Neuron {
  constructor(X, x, y) {
    this.x = x;
    this.y = y;
    this.w = Array(X)
      .fill(0)
      .map((value) => rnd(0, 1));
    this.color = "rgb(255,255,255)";
  }
  render() {
    context.fillStyle = this.color;
    context.clearRect(this.x, this.y, WIDTH_BLOCK, HEIGHT_BLOCK);
    context.fillRect(this.x, this.y, WIDTH_BLOCK, HEIGHT_BLOCK);
  }
  averageWeights() {
    this.length = this.w.length;
    this.devided = Math.floor(this.w.length / 3);

    this.avgR =
      this.w.slice(0, this.devided).reduce((accum, value) => accum + value, 0) /
      this.w.length;

    this.avgG =
      this.w
        .slice(this.devided, this.devided * 2)
        .reduce((accum, value) => accum + value, 0) / this.w.length;

    this.avgB =
      this.w
        .slice(this.devided * 2, this.devided * 3)
        .reduce((accum, value) => accum + value, 0) / this.w.length;
  }
  recolor() {
    this.averageWeights();
    this.color =
      "rgb(" +
      this.avgR * 255 +
      "," +
      this.avgG * 255 +
      "," +
      this.avgB * 255 +
      ")";
    this.render();
  }
}
class SOM {
  constructor(n) {
    this.neurons = [];
    this.x = 1;
    this.y = 1;
    this.sigma0 = Math.max(WIDTH * WIDTH_BLOCK, HEIGHT * HEIGHT_BLOCK) / 2;
    this.lambda = 0;
    this.sigma = 0;
    this.L = 0;
    this.theta = 0;
    this.r = 0;
    this.neighbors = [];
    this.classes = [];
    this.images = {};

    for (let i = 0; i <= WIDTH * HEIGHT; i++) {
      this.neurons.push(new Neuron(n, this.x, this.y));
      if (this.x + WIDTH_BLOCK <= WIDTH * WIDTH_BLOCK) {
        this.x += WIDTH_BLOCK;
      } else {
        this.x = 1;
        this.y += HEIGHT_BLOCK;
      }
    }
    this.neurons.forEach((neuron) => neuron.render());
  }
  recolor() {
    this.neurons.forEach((value) => value.recolor());
  }
  indexMinimum(D) {
    let index = 0,
      min = D[index];
    for (let i = 1; i < D.length; i++) {
      if (D[i] < min) {
        index = i;
        min = D[i];
      }
    }
    return index;
  }
  neuronWinner(y) {
    this.D = [];
    this.neurons.forEach((neuron, indexNeuron) => {
      this.s = 0;
      y.forEach((input, indexInput) => {
        this.s += (input - neuron.w[indexInput]) ** 2;
      });
      this.D.push(Math.sqrt(this.s));
    });
    return this.indexMinimum(this.D);
  }
  coincidences() {
    this.images = {};
    this.classes.forEach((value, indexValue) => {
      if (this.images[value] == undefined) {
        this.images[value] = [];
      }
      this.images[value].push(indexValue);
    });
    this.render();
  }
  render() {
    document.querySelector(".table").innerHTML = "<table></table>";
    let th = "";
    Object.keys(this.images).forEach((indexNeuron) => {
      let winner = this.neurons[indexNeuron],
        colorWinner =
          "rgb(" +
          winner.avgR * 255 +
          "," +
          winner.avgG * 255 +
          "," +
          winner.avgB * 255 +
          ")";
      th +=
        "<th style='background:" +
        colorWinner +
        "'> Neuron#" +
        indexNeuron +
        "</th>";
    });
    let first_tr = "<thead><tr>" + th + "</tr></thead><tbody>";
    document.querySelector(".table table").innerHTML += first_tr;
    let tr = "",
      td = "",
      i = 0;
    Ts.forEach((value, indexImage) => {
      tr += "<tr>";
      td = "";
      Object.keys(this.images).forEach((key, indexClass) => {
        if (this.images[key][i] != undefined) {
          let src = images[this.images[key][i]].src;
          td +=
            "<td><img src='" +
            src +
            "' onclick='nn.search([Ts[" +
            this.images[key][i] +
            "]])'></td>";
        } else {
          td += "<td></td>";
        }
      });
      tr += td + "</tr>";
      i++;
    });
    document.querySelector(".table table").innerHTML += tr;
    document.querySelector(".table table").innerHTML += "</tbody>";
  }
  defenitionClass(winner) {
    this.classes.push(winner);
  }
  search(y) {
    this.classes = [];
    this.neurons.forEach((value) => {
      value.color = "rgb(255,255,255)";
      value.render();
    });
    y.forEach((value) => {
      this.winner = this.neuronWinner(value);
      this.neurons[this.winner].recolor();
      this.defenitionClass(this.winner);
    });
  }
  learn(T = 10, L0 = 0.33) {
    this.lambda = T / Math.log(this.sigma0);
    Ts.forEach((value, indexValue) => {
      let randomExample = value;
      this.currentWinner = this.neurons[this.neuronWinner(randomExample)];
      for (let t = 0; t < T; t++) {
        this.sigma = this.sigma0 * Math.exp(-(t / this.lambda));
        this.L = L0 * Math.exp(-(t / this.lambda));
        this.neighbors = this.neurons.filter(
          (neuron) =>
            Math.sqrt(
              (neuron.x - this.currentWinner.x) ** 2 +
                (neuron.y - this.currentWinner.y) ** 2
            ) < this.sigma
        );
        this.neighbors.forEach((neuron, indexNeuron) => {
          this.r = Math.sqrt(
            (neuron.x - this.currentWinner.x) ** 2 +
              (neuron.y - this.currentWinner.y) ** 2
          );
          this.theta = Math.exp(-(this.r ** 2 / (2 * this.sigma ** 2)));

          neuron.w.forEach((weight, indexWeight) => {
            this.neighbors[indexNeuron].w[indexWeight] +=
              this.theta * this.L * (value[indexWeight] - weight);
          });
        });
      }
    });
    this.recolor();
  }
  action(n, l) {
    this.learn(n, l);
    this.search(Ts);
    this.coincidences();
    this.recolor();
  }
}

window.onload = () => {
  pixels = images.map((value, indexValue) => {
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(value, 0, 0);
    let data = [];
    for (let x = 0; x < canvas.width; x++) {
      for (let y = 0; y < canvas.height; y++) {
        let rgb = context.getImageData(x, y, 1, 1).data.slice(0, 3);
        rgb.forEach((colorValue) => data.push(colorValue));
      }
    }
    return data;
  });
  cArr();
  nn = new SOM(196608);
};
