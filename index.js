const N = [3],
  Xn = 194,
  Yn = 114;
let L = N.length,
  Ts = [],
  secondTs = [],
  classes = [],
  colors = [
    "row-cell__green",
    "row-cell__yellow",
    "row-cell__maroon",
    "row-cell__red",
    "row-cell__snow",
    "row-cell__purple",
    "row-cell__blue",
    "row-cell__lightGreen",
  ];

function cArr(x, y) {
  /*
    Наполнение массива примеров обучающей выборки.
    Аргумент:
    x : тип данных (целое число) - количество строк в пространстве
    y : тип данных (целое число) - количество ячеек в строке
  */
  let sumX = 0,
    sumY = 0,
    sumZ = 0,
    step = 2;
  // Пробегаемся по росту, начиная от 153 см до x с шагом 2
  for (let height = 153; height < x; height += step) {
    sumX += height ** 2; //Считаем сумму квадратов по росту
  }
  // Пробегаемся по весу, начиная от 153 см до x с шагом 2
  for (let weight = 45; weight < y; weight += step) {
    sumY += weight ** 2; //Считаем сумму квадратов по весу
  }
  for (let height = 153; height < x; height += step) {
    for (let weight = 45; weight < y; weight += step) {
      sumZ += weight / (height / 100) ** 2; //Считаем сумму квадратов по индексу массы тела
    }
  }
  for (let height = 153; height < x; height += step) {
    for (let weight = 45; weight < y; weight += step) {
      let ibm = weight / (height / 100) ** 2; //Расчет индекса массы тела
      Ts.push([
        height / Math.sqrt(sumX),
        weight / Math.sqrt(sumY),
        ibm / Math.sqrt(sumZ),
      ]); //Формирование обучающего примера
      secondTs.push([height, weight, ibm]); //Дублирование обучающей выборки без нормализации данных
    }
  }
}

function rnd(min, max) {
  /*
    Функция случайного числа в диапазоне min - max
    Аргументы:
    min : тип данных (вещественное) - от какого числа начинается диапазон случайных чисел
    max : тип данных (вещественное) - каким числом заканчивается диапазон случайных чисел
  */
  return min + Math.random() * (max - min);
}

class Neuron {
  /* 
    Класс одного нейрона. 
    Аргументы:
    w : тип данных (целое число) - количество синапсов у данного нейрона
  */
  constructor(
    w,
    a // Инициализация переменных для нейрона
  ) {
    this.w = Array(w)
      .fill(0)
      .map((value, index) => rnd(0.093, 0.216)); // Инициализируем массив весовых коэффициентов
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
            return new Neuron(indexLayer == 0 ? 3 : N[indexLayer - 1]); // Возвращаем экземпляр класса нового нейрона
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
    classes[indexNeuron].push(secondTs[index][2]); // Добавляем индекс массы тела (не нормализованный) в соответствующий класс
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
function learn(action = 0, a = 0.3, b = 0.001, number = 10) {
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
  let t = document.querySelectorAll(".row"), // Записываем в переменную t все строки таблицы
    classIndex = 0, // Индекс класс к которому пренадлежит маркируемая ячейка
    height = 153; // Минимальное значение роста

  for (
    let row = 0;
    row < t.length;
    row++ // Перебираем все строки таблицы
  ) {
    let weight = 45; // Минимальное значение веса
    height += 2; // Увеличиваем рост с шагом 2
    let c = t[row].querySelectorAll(".row-cell"); //Записываем в переменную c все ячейки строки
    for (
      let cell = 0;
      cell < c.length;
      cell++ // Перебираем все ячейки строки
    ) {
      weight += 2; // Увеличиваем  вес с шагом в 2
      let ibm = weight / (height / 100) ** 2; // Расчитываем индекс массы тела
      colors.forEach((selector) => c[cell].classList.remove(selector)); //Очищаем все селекторы модификаторы
      classes.forEach((values, indexClass) =>
        values.forEach((value, indexValue) => {
          //Перебираем классы и все элементы в них
          if (value == ibm) {
            // Если хоть одно значение в классе совпадает с текущим индексом массы тела
            classIndex = indexClass; // Тогда присваиваем переменной classIndex индекс данного класса
          }
        })
      );
      answer(classIndex, row, cell); // Закрашиваем ячейку
    }
  }
  google.charts.setOnLoadCallback(drawChart); //Отображаем график
}
function answer(index, x, y) {
  /*
    Процедура маркирующая ячейки соответствующим цветом в зависимости от класса
    Аргументы:
    index : тип данных (вещественный) - индекс класса
    x     : тип данных (целочисленный) - координата x ячейки
    y     : тип данных (целочисленный) - координата y ячейки
  */
  var Table = document
    .querySelectorAll(".row")
    [x].querySelectorAll(".row-cell")[y]; // Получаем ячейку
  Table.classList.toggle(colors[index]); // Закрашиваем ячейку соответствующим цветом по номеру класса
}

google.charts.load("current", { packages: ["corechart"] });
function drawChart() {
  let results = [["Итерация", "Ответ сети"]],
    indexTrain = 0;
  classes.forEach((value, indexValue) =>
    value.forEach((answer, indexAnswer) => {
      results.push([indexValue, answer]);
      indexTrain++;
    })
  );
  var data = google.visualization.arrayToDataTable(results);

  var options = {
    title: "Результат классификации",
    hAxis: { title: "Класс" },
    vAxis: { title: "Индекс массы тела" },
    legend: "none",
  };

  var chart = new google.visualization.ScatterChart(
    document.querySelector(".network-answers")
  );

  chart.draw(data, options);
}
window.onload = () => {
  cArr(Xn, Yn);
}; //  Проведение инициализации и наполнения массива обучающей выборки при загрузке страницы
