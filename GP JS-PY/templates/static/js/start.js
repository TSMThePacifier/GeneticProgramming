/********************************************************ENTRADAS************************************************************/
let dataSet;
let parent;
getData();

/********************************************************ENTRADAS************************************************************/
let maxPop;
let mutationRate;
let population;

//da la configuracion inicial a los valores requeridos
function setup() {
  let iniPop = parent.replace(/\s/g, '').split('');
  maxPop = 30;
  mutationRate = 0.01;
  population = new Population(dataSet, iniPop, maxPop, mutationRate);
}

//inicia el ciclo de la reproduccion mediante las llamadas a los metodos en la clase "POPULATION"
function draw() {
  population.naturalSelection();
  population.generate();
  population.evaluate();

  if (population.isFinished()) {
    noLoop();
    sendInfo();
    finalInfo();
  }
    actualInfo(); 
}

//despliega la información resultado en pantalla
function actualInfo() {
  document.getElementById("iniPopulation").innerHTML = population.initialExpressions();

  let statstext = "Generaciones Totales:    " + population.getGenerations() + "<br>";
  statstext += "Población por Generación:      " + maxPop + "<br>";
  statstext += "Promedio de Fitness:       " + nf(population.getAverageFitness()) + "<br>";  
  statstext += "Rango de Mutación:         " + floor(mutationRate * 100) + "%";

  document.getElementById("information").innerHTML = statstext;
  document.getElementById("expressions").innerHTML = population.allExpressions();
}

function finalInfo() {
  document.getElementById("solutions").innerHTML = population.getBestSolution();
  document.getElementById("dataset").innerHTML = population.getDataSet();
}

function getData() {
  $.ajax({
    type: 'GET',
    dataType: "json",
    url: "/getData",
    success: function (data) {
      dataSet = JSON.parse(data);
      parent = dataSet.Function;
      delete dataSet["Function"];
    },
    error: function (datos) {
    },
  });
}

function sendInfo() {
  $.ajax({
    type: 'POST',
    dataType: "json",
    data: { "solution": population.getBestSolution() }, //Object.assign({}, population.getBestSolution())}, 
    url: "/testGenerate",
    success: function (datos) {
      alert("EXITO");
    },
    error: function (datos) {
      alert("ERROR");
    },
  });
}