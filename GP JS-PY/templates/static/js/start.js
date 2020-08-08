let result;
let popmax;
let mutationRate;
let initialPop;
let population;

/********************************************************ENTRADAS************************************************************/
let t1= new Tree("+",["30","4"]);
let t2= new Tree("+",[new Tree("/",["5","1"]),new Tree("+",[new Tree("/",["2","1"]),"3"])]);
let t3= new Tree("+",[new Tree("+",["2","2"]),new Tree("+",["3","4"])]);

/********************************************************ENTRADAS************************************************************/


//da la configuracion inicial a los valores requeridos
function setup() {
  result= 34; //resultado esperado
  popmax = 30; //poblacion maxima
  mutationRate = 0.01;
  initialPop= [t1,t2,t3];// poblacion inicial (arboles)
  population = new Population(result, popmax, mutationRate, initialPop);
}

//inicia el ciclo de la reproduccion mediante las llamadas a los metodos en la clase "POPULATIONF"
function draw() { 
  population.naturalSelection(); 
  population.generate(); 
  population.evaluate();

  if (population.isFinished()) {
    noLoop();
  }
  displayInfo();
  sendInfo();
}

//despliega la información resultado en pantalla
function displayInfo() {
  let answer = population.getBest();
  document.getElementById("iniPopulation").innerHTML = population.initialExpressions();
  document.getElementById("solutions").innerHTML = answer;
  document.getElementById("expected").innerHTML = result;  
  
  let statstext = "Total generations:     " + population.getGenerations() + "<br>";
  statstext += "Average fitness:       " + nf(population.getAverageFitness()) + "<br>";
  statstext += "Total population:      " + popmax + "<br>";
  statstext += "Mutation rate:         " + floor(mutationRate * 100) + "%";

  document.getElementById("information").innerHTML = statstext;
  document.getElementById("expressions").innerHTML = population.allExpressions();
}

function sendInfo() {
  $.ajax({
    type: 'POST',
    dataType: "json",
    data: {"solutions": Object.assign({}, population.getBestSolutions())}, //population.getBestSolutions()},
    url: "/testGenerate",
    success: function (datos) {
      alert("EXITO");
      console.log(datos);
      console.log(typeof datos);
      paraPrueba= datos;
    },
    error: function (datos) {
      alert("ERROR");
    },
  });

}