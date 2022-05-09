const N = [3],
  Xn = 194,
  Yn = 114;
let L = N.length,
  Ts = [],
  classes = [],
  images = Array(22)
    .fill(0)
    .map((value) => new Image());
images.forEach(
  (value, index) => (images[index].src = "images/" + (index + 1) + ".png")
);
let canvas = document.querySelector("#canvas"),
  i = 0,
  context = canvas.getContext("2d");

function cArr() {
  /*
		Наполнение массива примеров обучающей выборки.
		Аргумент:
		x : тип данных (целое число) - количество строк в пространстве
		y : тип данных (целое число) - количество ячеек в строке
	*/
  let sum = Array(pixels[0].length).fill(0);
  // Пробегаемся по росту, начиная от 153 см до x с шагом 2
  pixels.forEach((value, indexValue) =>
    value.forEach((pixel, indexPixel) => (sum[indexPixel] += pixel ** 2))
  );
  pixels.forEach((value, indexValue) => {
    Ts.push(
      sum.map(
        (sumSquare, indexSumSquare) =>
          value[indexSumSquare] / Math.sqrt(sumSquare)
      )
    );
  });
  context.clearRect(0, 0, canvas.width, canvas.height);
}

function rnd(min, max) {
  return min + Math.random() * (max - min);
}

class Neuron {
  /* 
    Класс одного нейрона. 
    Аргументы:
    w : тип данных (целое число) - количество синапсов у данного нейрона
  */
  constructor(
    w // Инициализация переменных для нейрона
  ) {
    this.w = Array(w)
      .fill(0)
      .map((value, index) => rnd(0.05930270274643716, 0.22998692455366165)); // Инициализируем массив весовых коэффициентов
  }
}

let neurons = Array(N.length)
  .fill(0)
  .map(
    // Создаем нейронную сеть из экемпляров класса Neuron
    (
      layer,
      indexLayer // Создаем N.length слоёв
    ) => {
      return Array(N[indexLayer])
        .fill(0)
        .map(
          // Возвращаем слой с наполненным количеством N[indexLayer] нейронов
          (
            neuron,
            indexNeuron // Создаем N[indexLayer] нейронов в слое
          ) => {
            return new Neuron(indexLayer == 0 ? 262144 : N[indexLayer - 1]); // Возвращаем экземпляр класса нового нейрона
          }
        );
    }
  );

function kohonen(a, w, y) {
  /*
    Функция минимизацы разниы между входными сигналами нейрона и его весовыми коэффициентами
    Аргументы:
    a : тип данных (вещественный) - скорость обучения нейронов
    w : тип данных (список) - весовые коэффициенты победившего нейрона
    y : тип данных (список) - входные данные для победившего нейрона
  */
  //Корректруем весовые коэффициенты согласно формуле
  w.forEach(
    (weight, indexWeight) => (w[indexWeight] += a * (y[indexWeight] - weight))
  );
}
function indexMinimum(D) {
  /*
    Функция определения минимального расcтояния между нейронами и входным воздействием
    Аргументы:
    D : тип данных (список) - значения полученные по формуле корня квадратного суммы квадрата разности
  */
  let index = 0,
    min = D[index]; // Устанавливаем первый жлемент списка как минимальный
  for (
    let i = 1;
    i < D.length;
    i++ //Пробегаемся по всем элементам кроме первого
  ) {
    if (D[i] < min) {
      // Если текущий элемент меньше предыдущего минимума
      index = i; // Тогда меняем индекс минимального элемента
      min = D[i]; // Изменяем значение минимального элемента
    }
  }
  return index; //Возвращаем индекс минимального элемента
}
function neuronWinner(y, layer = 0) {
  /*
    Функция определения нейрона победителя (ближайшего к входному воздействию)
    Аргументы:
    y     : тип данных (список) - входное воздействие
    layer : тип данных (целое) - номер слоя, по умолчанию первый слой
  */
  let D = []; //Список для хранения растояний между нейронами и входным воздействием
  neurons[layer].forEach(
    (
      neuron,
      indexNeuron // Перебор всех нейронов
    ) => {
      let s = 0; // Инициализация переменной для суммирования
      y.forEach(
        (
          input,
          indexInput // Перебор данных входного воздействия
        ) => {
          s += (input - neuron["w"][indexInput]) ** 2; // Суммирование разности квадратов
        }
      );
      D.push(Math.sqrt(s)); // Добавление расстояния в список
    }
  );
  return indexMinimum(D); // Возвращение индекса победившего нейрона
}

function layerTraining(a, x) {
  /*
    Процедура обучения нейрона в слое
    Аргументы:
    a     : тип данных (вещественное) - коэффициент скорость обучения
    x     : тип данных (список) - входное воздействие
  */
  let indexNeuron = neuronWinner(x); // Получение индекса победившего нейрона
  kohonen(a, neurons[0][indexNeuron]["w"], x); // Уменьшение расстояния между нейроном и входным воздействием
}

function belong(x, index, action = 1) {
  /*
    Процедура отнесения входного воздействия к соответствующему классу
    Аргументы:
    x      : тип данных (список) - входное воздействие
    index  : тип данных (целый)  - индекс победившего нейрона
    action : тип данных (целый)  - определение действия (1 - наполнение классов; 0 - очистка списка классов)
    
  */
  if (action) {
    // Если action == 1
    // Если классов нет, то создаем пустые списки по количество нуйронов в слое, иначе оставляем как есть
    classes = !classes.length ? neurons[0].map((value) => []) : classes;
    let indexNeuron = neuronWinner(x); // Получаем индекс победившего нейрона
    classes[indexNeuron].push(images[index]); // Добавляем индекс массы тела (не нормализованный) в соответствующий класс
  } // Иначе
  else {
    classes = neurons[0].map((value) => []); // Очищаем классы
  }
}
function amountClasses() {
  /*
    Функция определения количества элементов в каждом классе
  */
  belong(0, 0, 0); // Очищаем классы
  Ts.forEach((value, indexValue) => belong(value, indexValue)); // Относим каждое входное воздействие в соответствующий класс
  return classes.map((value) => value.length); // Возвращаем список состоящий из количества элементов в каждом клссе
}
function learn(action = 0, a = 0.3, b = 0.05, number = 10) {
  /*
    Процедру запуска алгоритма обучения нейронной сети
    Аргументы:
    action : тип данных (число) - если 0, тогда только отображает результат работы НС, иначе запускает обучение
    a      : тип данных (вещественный) - скорость обучения нейронов 
    b      : тип данных (вещественный) - темп сокращения скорости обучения
    number : тип данных (целый) - количество повторений на одном значении коэффициента a
  */
  if (action) {
    //Если action не равен нулю
    while (a > 0) {
      // Повторяем пока a больше нуля
      console.log(a);
      for (
        let i = 1;
        i < number;
        i++ //Пробегаемся по всем эпохам
      ) {
        // Перебираем все примеры из обучающей выборки, и подаем на вход функции hebba случайные значения из неё
        Ts.forEach((x, index) => {
          layerTraining(a, Ts[parseInt(Math.random() * Ts.length)]);
        });
      }
      a -= b; // Уменьшаем коэффициент скорости обучения
    }
  }

  /*
    Блок отрисовки результатов интерпритации НС (нейронной сети)
  */

  amountClasses(); //Наполняем массив классов
  render();
}

function render() {
  document.querySelector(".table").innerHTML = "<table></table>";
  let th = "";
  classes.forEach(
    (value, indexValue) => (th += "<th> Класс №" + indexValue + "</th>")
  );
  let first_tr = "<thead><tr>" + th + "</tr></thead><tbody>";
  document.querySelector(".table table").innerHTML += first_tr;
  for (let i = 0; i < Ts.length; i++) {
    let tr = "<tr>",
      td = "";
    classes.forEach((value, indexValue) => {
      let src = value[i] != undefined ? value[i].src : "";
      td += "<td><img src='" + src + "'></td>";
    });
    tr += td + "</tr>";
    document.querySelector(".table table").innerHTML += tr;
  }
  document.querySelector(".table table").innerHTML += "</tbody>";
}

let pixels = [];
window.onload = () => {
  pixels = images.map((value) => {
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(value, 0, 0);
    let data = context.getImageData(0, 0, canvas.width, canvas.height).data;
    return data;
  });
  cArr();
};
