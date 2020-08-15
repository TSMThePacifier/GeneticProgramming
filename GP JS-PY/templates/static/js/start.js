let popmax;
let mutationRate;
let population;

/********************************************************ENTRADAS************************************************************/

/*let dataSet= [[65, 44, 87, 23, 2110],[31, 44, 75, 0, 75],[47, 0, 92, 98, 9063],[64, 50, 1, 83, 197],[1, 55, 43, 79, 3453],
[19, 60, 10, 78, 859],[41, 72, 11, 94, 1147],[91, 84, 58, 79, 4757],[33, 19, 43, 96, 4180],[22, 96, 44, 31, 1482]];*/
let dataSet;
let parent;
getData();

//let t1= new Tree("+",[new Tree("+",["a","b"]),new Tree("*",["c","d"])]);

/********************************************************ENTRADAS************************************************************/

function stringToTree(string) {
  let arrayParent = string.replace(/\s/g, '').split('');
  console.log(arrayParent);
  let finalTree= new Tree("", []);
  let tempTree;
  let child = [];
  let value = "";

  for (let i = 0; i < arrayParent.length; i++) {
    console.log(arrayParent[i]);
    if((arrayParent[i].toUpperCase() != arrayParent[i].toLowerCase()) || !isNaN(arrayParent[i])){      
      child.push(arrayParent[i]);    
    }else{
      if(child.length=== 0){
        finalTree.value = arrayParent[i];
        finalTree.child.push(tempTree);
      }else{
        value = arrayParent[i];
      }      
    }

    if (child.length === 2) {
      tempTree = new Tree(value, child);
      child = [];
    }
  }

  finalTree.child.push(tempTree);
  return finalTree;
}


//da la configuracion inicial a los valores requeridos
function setup() {
  /*getData().then(function(data){
    dataSet= data;
  })
  .catch(function(message){
    console.log("Error");
  });*/

  //iniPop= "a+b+c*d";
  iniPop=[stringToTree(parent)];
  popmax = 30; //poblacion maxima
  mutationRate = 0.01;
  population = new Population(dataSet, iniPop, popmax, mutationRate);
}

//inicia el ciclo de la reproduccion mediante las llamadas a los metodos en la clase "POPULATION"
function draw() {
  population.naturalSelection();
  population.generate();
  population.evaluate();  

  if (population.isFinished()) {
    noLoop();
    sendInfo();
    displayInfo();
  }
}

//despliega la información resultado en pantalla
function displayInfo() {
  document.getElementById("iniPopulation").innerHTML = population.initialExpressions();
  document.getElementById("solutions").innerHTML = population.getBestSolution();
  //document.getElementById("expected").innerHTML = population.getResult;

  let statstext = "Total generations:     " + population.getGenerations() + "<br>";
  statstext += "Average fitness:       " + nf(population.getAverageFitness()) + "<br>";
  statstext += "Total population:      " + popmax + "<br>";
  statstext += "Mutation rate:         " + floor(mutationRate * 100) + "%";

  document.getElementById("information").innerHTML = statstext;
  document.getElementById("expressions").innerHTML = population.allExpressions();
}

function getData() {
  //return new Promise(function (resolve, reject) {
    $.ajax({
      type: 'GET',
      dataType: "json",
      url: "/getData",
      success: function (data) {
        dataSet= JSON.parse(data);
        parent= dataSet.Function;
        delete dataSet["Function"];
     //   resolve(data);
      },
      error: function (datos) {
    //    reject("error");
      },
    });
  //})
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