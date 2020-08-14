class Population {

  //constructor que inicializa la poblacion
  constructor(dtSet, iniPop, pmax, mut) {

    //datos iniciales o entradas
    this.dataSet = dtSet;
    this.popMax = pmax;
    this.mutationRate = mut;

    //datos del algoritmo
    this.values = [];
    this.result;
    this.population = [];
    this.matingPool = [];
    this.generations = 0;
    this.perfectScore = 100;
    this.bestSolution = "";
    this.finished = false;
    this.dataSetCursor = -1;

    //genes para mutacion
    this.signs = ['-', '*', '/', "+"];
    this.numberOrLetter = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];

    //proceso de inicializacion de la poblacion
    this.nextValues();
    console.log(this.values);
    console.log(this.result);
    this.initPopulation(iniPop);
    this.initialPopulation = this.population.slice();//copia de la poblacion inicial
    this.includeLettersToGens();
  }

  //incluye los parametros del metodo dentro de los posibles valores para mutar
  includeLettersToGens() {
    for (let i = 0; i < this.values.length; i++) {
      this.numberOrLetter.push(this.values[i][0]);
    }
  }

  //cambia los valores de las variables a reemplazar por los siguientes en el dataset
  nextValues() {
    let index = ++this.dataSetCursor;
    let dsLen = this.dataSet[index].length - 1
    this.values = [];
    let letter = 'a';

    for (let i = 0; i < dsLen; i++) {
      this.values.push([letter, dataSet[index][i]]);
      letter = String.fromCharCode(letter.charCodeAt() + 1);
    }

    this.result = dataSet[index][dsLen];
  }

  initPopulation(iniPop) {    
    //ecuacion inicial
    for (let i = 0; i < iniPop.length; i++) {
      let tree =iniPop[i];
      tree.arrayTree = this.treeToArray(tree);
      tree.calcFitness(this.getTreeResult(tree.arrayTree, this.values), this.result);
      this.population.push(tree);
    }

    //restante random
    for (let i = 0; i <this.popMax-iniPop.length; i++) {
      let tree = this.randomTree();
      tree.arrayTree = this.treeToArray(tree);
      tree.calcFitness(this.getTreeResult(tree.arrayTree, this.values), this.result);
      this.population.push(tree);
    }
  }

  //genera un arbol aleatorio
  randomTree() {
    let tempVars = this.values.slice();//copiar array
    let child = [];
    let finalTree = new Tree(this.newSign(), []);
    let tempTree;
    let index;

    for (let i = 0; i < this.values.length; i++) {//********** forma de determinar los nodos iniciales
      index = 0;
      if (tempVars.length !== 1) {
        index = this.randFloor(0, tempVars.length - 1);
      }

      child.push(tempVars[index][0]);
      tempVars.splice(index, 1);

      if (child.length === 2) {
        tempTree = new Tree(this.newSign(), child);
        finalTree.child.push(tempTree);
        child = [];
      }
    }
    return finalTree;
  }

  //convierte un arbol en un arreglo para su más facil manejo
  treeToArray(tree) {
    let fullTree = [];
    for (let i = 0; i < tree.child.length; i++) {
      if (typeof tree.child[i] === "object") {// si es object es un subarbol sino es solo un nodoTerminal/hoja
        fullTree.push(this.treeToArray(tree.child[i])); //se usa recursividad para recorrer subArboles del arbol original
      } else {
        fullTree.push(tree.child[i]);
      }

      if (i === 0) {
        fullTree.push(tree.value);
      }
    }
    return fullTree;
  }

  //se calcula el resultado de la solucion para un arbol 
  getTreeResult(arrayTree, values) {
    let vals = values.slice();
    let fullTree = "(";

    for (let i = 0; i < arrayTree.length; i++) {
      if (typeof arrayTree[i] === "object") {
        fullTree += this.getTreeResult(arrayTree[i], values);
      } else {
        if (i !== 1 && isNaN(arrayTree[i])) {
          let val = values.filter(v => v[0] == arrayTree[i])
          fullTree += val[0][1];
        } else {
          fullTree += arrayTree[i];
        }
      }
    }
    fullTree += ")";
    let e = eval(fullTree);
    if (e < 0) {
      e = "(" + e + ")"; //si el numero es negativo se devuelve con parentesis para evitar errores en le calculo
    }

    return e;
  }

  //se calcula cuales son los padres mas aptos y se llena el matingPool con mayor cantidad de esos, con base en el fitness 
  naturalSelection() {
    this.matingPool = [];

    for (let i = 0; i < this.population.length; i++) {

      let fitness = map(this.population[i].fitness, 0, 100, 0, 1);
      let n = floor(fitness * 100);

      for (let j = 0; j < n; j++) {
        this.matingPool.push(this.population[i]);
      }
    }
  }

  //se generan los nuevos hijos mediante el cruce y la mutacion
  generate() {
    let newPop = [];

    for (let i = 0; i < this.popMax; i++) {
      let partnerA = this.matingPool[this.randFloor(0, this.matingPool.length - 1)];
      let partnerB = this.matingPool[this.randFloor(0, this.matingPool.length - 1)];

      console.log("partnerA");
      console.log(partnerA);
      console.log("partnerB");
      console.log(partnerB);

      let child = this.crossover(partnerA.arrayTree, partnerB.arrayTree);

      console.log("newChild");
      console.log(child);

      this.mutate(this.mutationRate, child);
      this.additionMutate(child, this.values);//mutacion por agregacion

      console.log("childmutate");
      console.log(child);

      let tree = this.arrayToTree(child);//se transforma el nuevo hijo que es un array en un arbol
      tree.arrayTree = child;

      tree.calcFitness(this.getTreeResult(child, this.values), this.result);
      newPop.push(tree);
    }
    this.population = newPop; //se reemplaza la antigua poblacion
    this.generations++;
  }

  //se hace un cruce de un padre A con un padre B para generar un nuevo hijo
  crossover(partnerA, partnerB) {

    //se obtienen todos los subArboles que tiene cada padre
    let pA = this.getSubTrees(partnerA);
    let pB = this.getSubTrees(partnerB);

    //se elegi del padre B cual es la parte que se va insertar en el hijo 
    let replacement;

    //si el padre B no tiene subArboles entonces se selecciona un nodoTerminal/hoja
    if (pB.length !== 0) {
      replacement = pB[Math.abs(this.randFloor(0, pB.length - 1))];
    } else {
      let indexOptions = [0, 2];
      replacement = partnerB[indexOptions[this.randFloor(0, 1)]];//elegir un terminal u otro
    }

    let newChild = partnerA.slice();// se crea el hijo nuevo apartir del padre A

    if (pA.length !== 0) {
      let selectedNode = pA[Math.abs(this.randFloor(0, pA.length - 1))];
      let stringChild = JSON.stringify(newChild);

      //se reemplaza en el nuevo hijo una parte extraida del padre B
      let modifiedChild = stringChild.replace(JSON.stringify(selectedNode), JSON.stringify(replacement));
      newChild = JSON.parse(modifiedChild);
    } else {
      let indexOptions = [0, 2];
      newChild[indexOptions[this.randFloor(0, 1)]] = replacement;
    }
    return newChild;
  }

  mutate(mutationRate, arrayTree) {
    for (let i = 0; i < arrayTree.length; i++) {
      if (typeof arrayTree[i] === "object") {
        this.mutate(mutationRate, arrayTree[i]);
      } else {
        let randM = this.rand(0, 1);
        if (randM < mutationRate) {
          console.log("MUTATE!!!");

          if ((arrayTree[i].toUpperCase() != arrayTree[i].toLowerCase()) || !isNaN(arrayTree[i])) {
            arrayTree[i] = this.newNumberOrLetter();
          } else {
            arrayTree[i] = this.newSign();
          }
        }
      }
    }
    return arrayTree;
  }

  additionMutate(arrayTree, values) {
    console.log("addition");
    console.log(arrayTree);

    for (let i = 0; i < values.length; i++) {

      let arrayTreeString = JSON.stringify(arrayTree);
      if (arrayTreeString.search(values[i][0]) === -1) {
        console.log(arrayTreeString);
        console.log("not contain");
        console.log(values[i][0]);
        let indexOptions = [0, 2];
        let index = indexOptions[this.randFloor(0, 1)];
        let tempChild = arrayTree[index];
        let tree = [tempChild, this.newSign(), values[i][0]];
        arrayTree[index] = tree;
      }
    }
  }

  //se obtienen los subArboles que tiene un arbol en su totalidad
  getSubTrees(arrayTree) {
    let subTrees = [];

    for (let i = 0; i < arrayTree.length; i++) {
      if (typeof arrayTree[i] === "object") {
        subTrees.push(arrayTree[i]);
        let tree = this.getSubTrees(arrayTree[i]);
        if (tree.length !== 0) {
          subTrees.push(tree[0]);
        }
      }
    }
    return subTrees;
  }

  //se convierte un array en un nuevo arbol
  arrayToTree(arrayTree) {
    let tree;
    let child = [];
    let value = "";

    for (let i = 0; i < arrayTree.length; i++) {
      if (typeof arrayTree[i] === "object") {
        child.push(this.arrayToTree(arrayTree[i]));
      } else {
        if (i === 1) {
          value = arrayTree[i];
        } else {
          child.push(arrayTree[i]);
        }
      }
    }
    tree = new Tree(value, child);
    return tree;
  }

  //se genera un nuevo signo aleatorio
  newSign() {
    let s = this.randFloor(0, this.signs.length - 1);
    return this.signs[s];
  }

  newNumberOrLetter() {
    let s = this.randFloor(0, this.numberOrLetter.length - 1);
    return this.numberOrLetter[s];
  }

  //se genera un numero aleatoria entero
  randFloor(min, max) {
    return Math.floor(Math.random() * (+max + 1 - +min)) + +min;
  }

  //se genera un numero aleatorio decimal
  rand(min, max) {
    return Math.random() * (+max - +min) + +min;
  }

  //se evalua en la poblacion actual si hay individuos con un fitness perfecto; osea que resuelve lo esperado
  evaluate() {
    for (let i = 0; i < this.population.length; i++) {

      if (this.population[i].fitness === this.perfectScore) {
        this.bestSolution = this.getExpression(this.population[i].arrayTree);
        this.finished = true;
        return;
      }
    }
  }

  //se obtiene la funcion almacenada en el arbo; ejm: (2*5)
  getExpression(arrayTree) {
    let fullTree = "(";
    for (let i = 0; i < arrayTree.length; i++) {
      if (typeof arrayTree[i] === "object") {
        fullTree += this.getExpression(arrayTree[i]);
      } else {
        fullTree += arrayTree[i];
      }
    }
    fullTree += ")";
    return fullTree;
  }

  //se obtienen el numero de generaciones creadas
  getGenerations() {
    return this.generations;
  }

  getBestSolution() {
    return this.bestSolution;
  }

  isFinished() {
    return this.finished;
  }

  //porcentaje promedio que existio como fitness
  getAverageFitness() {
    let total = 0;
    for (let i = 0; i < this.population.length; i++) {
      total += this.population[i].fitness;
    }
    return total / (this.population.length);
  }

  //se obtienen todas las funciones existentes en la poblacion
  allExpressions() {
    let everything = "";
    let displayLimit = min(this.population.length, 50);

    for (let i = 0; i < displayLimit; i++) {
      everything += this.getExpression(this.population[i].arrayTree);
      everything += " = " + this.getTreeResult(this.population[i].arrayTree, this.values) + "<br>";
    }
    return everything;
  }

  //se obtienen las funciones de la poblacion inicial
  initialExpressions() {
    let everything = "";

    for (let i = 0; i < this.initialPopulation.length; i++) {
      everything += this.getExpression(this.initialPopulation[i].arrayTree);
      everything += " = " + this.getTreeResult(this.initialPopulation[i].arrayTree, this.values) + "<br>";
    }
    return everything;
  }
}