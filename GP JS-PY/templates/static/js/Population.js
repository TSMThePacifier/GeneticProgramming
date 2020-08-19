class Population {

  //constructor que inicializa la poblacion
  constructor(dtSet, iniParent, maxPop, mutRate) {

    //datos iniciales o entradas
    this.dataSet = dtSet;
    this.initialParent = [this.unidimentionalArrayToTree(iniParent)];
    this.maxPopulation = maxPop;
    this.mutationRate = mutRate;

    //datos del algoritmo
    this.variables = iniParent.filter(v => this.isLetter(v));
    this.values = [];
    this.result;
    this.population = [];
    this.matingPool = [];
    this.generations = 0;
    this.perfectScore = 100;
    this.bestSolution = "";
    this.finished = false;

    //genes para mutacion
    this.signs = ['-', '*', '/', "+"];
    this.numberOrLetter = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

    //proceso de inicializacion de la poblacion
    this.assignValues();
    this.initPopulation(this.initialParent);
    this.initialPopulation = this.population.slice();//copia de la poblacion inicial
    this.includeValuesToGens();
  }

  //transforma el array unidimencional que contiene la solucion (ejm: ["a","+","b","-","c"]) en un arbol
  unidimentionalArrayToTree(arrayParent) {
    let tempTree = new Tree("", []);

    for (let i = 0; i < arrayParent.length; i++) {
      if (tempTree.child.length === 2) {
        tempTree = new Tree(arrayParent[i], [tempTree]);
        let recursiveTree = this.unidimentionalArrayToTree(arrayParent.slice(i + 1, arrayParent.length));

        if (recursiveTree.child.length === 1) {
          tempTree.child.push(recursiveTree.child[0]);
        } else {
          tempTree.child.push(recursiveTree);
        }
        return tempTree;
      } else {

        if (this.isLetter(arrayParent[i]) || !isNaN(arrayParent[i])) {
          tempTree.child.push(arrayParent[i]);
        } else {
          tempTree.value = arrayParent[i];
        }
      }
    }
    return tempTree;
  }

  //cambia los valores de las variables a reemplazar por los siguientes en el dataset
  assignValues() {
    this.values = [];
    let dsLen = this.dataSet[0].length - 1

    for (let i = 0; i < dsLen; i++) {
      this.values.push([this.variables[i], dataSet[0][i]]);
    }
    this.result = dataSet[0][dsLen];

    console.log("VALUES");
    console.log(this.values);
    console.log("RESULT: " + this.result);
  }

  //incluye los parametros del metodo dentro de los posibles valores para mutar
  includeValuesToGens() {
    for (let i = 0; i < this.variables.length; i++) {
      this.numberOrLetter.push(this.variables[i]);
    }
  }

  initPopulation(initialParent) {
    //ecuacion inicial
    for (let i = 0; i < initialParent.length; i++) {
      let tree = initialParent[i];
      tree.arrayTree = this.treeToArray(tree);
      tree.calcFitness(this.getTreeResult(tree.arrayTree, this.values), this.result);
      this.population.push(tree);
    }

    //restante random
    for (let i = 0; i < this.maxPopulation - initialParent.length; i++) {
      let tree = this.randomTree(this.variables);
      tree.arrayTree = this.treeToArray(tree);
      tree.calcFitness(this.getTreeResult(tree.arrayTree, this.values), this.result);
      this.population.push(tree);
    }
  }

  //genera un arbol aleatorio
  randomTree(variables) {
    let tempTree = new Tree(this.newSign(), []);
    let tempVars = variables.slice();//copiar array
    let index;

    for (let i = 0; i < variables.length; i++) {//********** forma de determinar los nodos iniciales

      if (tempTree.child.length === 2) {
        tempTree = new Tree(this.newSign(), [tempTree]);
        let recursiveTree = this.randomTree(tempVars);

        if (recursiveTree.child.length == 1) {
          tempTree.child.push(recursiveTree.child[0]);
        } else {
          tempTree.child.push(recursiveTree);
        }
        return tempTree;
      } else {
        index = 0;
        if (tempVars.length !== 1) {
          index = this.randFloor(0, tempVars.length - 1);
        }
      }

      tempTree.child.push(tempVars[index]);
      tempVars.splice(index, 1);
    }
    return tempTree;
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
  getTreeResult(arrayTree) {
    let solucion = this.getExpression(arrayTree);

    for (let i = 0; i < this.values.length; i++) {
        let regex = new RegExp(`\\b${this.values[i][0]}\\b`, 'gi');
        solucion = solucion.replace(regex, this.values[i][1]);
    }
    let resp = eval(solucion);

    if (resp < 0) {
      resp = "(" + resp + ")";
    }
    return resp;
  }

  //se obtiene la funcion almacenada en el arbo; ejm: a*b
  getExpression(arrayTree) {
    let fullTree = "";
    for (let i = 0; i < arrayTree.length; i++) {
      if (typeof arrayTree[i] === "object") {
        fullTree += this.getExpression(arrayTree[i]);
      } else {
        fullTree += arrayTree[i];
      }
    }
    return fullTree;
  }

  //se calcula cuales son los padres mas aptos y se llena el matingPool con mayor cantidad de esos, con base en el fitness 
  naturalSelection() {
    this.matingPool = [];

    for (let i = 0; i < this.population.length; i++) {
      // let fitness = map(this.population[i].fitness, 0, 100, 0, 1);
      // let reproductionPercentage = floor(fitness * 100);
      let reproductionRange = floor(this.population[i].fitness);
      for (let j = 0; j < reproductionRange; j++) {
        this.matingPool.push(this.population[i]);
      }
    }
  }

  //se generan los nuevos hijos mediante el cruce y la mutacion
  generate() {
    if (this.matingPool.length !== 0) {
      
      let newPop = [];
      for (let i = 0; i < this.maxPopulation; i++) {
        let parentA = this.matingPool[this.randFloor(0, this.matingPool.length - 1)];
        let parentB = this.matingPool[this.randFloor(0, this.matingPool.length - 1)];
        let child = this.crossover(parentA.arrayTree, parentB.arrayTree);

        this.mutate(this.mutationRate, child);
        this.additionMutate(child, this.values);//mutacion por agregacion

        let tree = this.arrayToTree(child);//se transforma el nuevo hijo que es un array en un arbol
        tree.arrayTree = child;

        tree.calcFitness(this.getTreeResult(child, this.values), this.result);
        newPop.push(tree);
      }
      this.population = newPop; //se reemplaza la antigua poblacion
      this.generations++;
    } else {
      alert("La reproducción no ha sido favorable, no existe ningún padre apto del cual generar una solución. Pruebe nuevamente");
    }
  }

  //se hace un cruce de un padre A con un padre B para generar un nuevo hijo
  crossover(parentA, parentB) {

    //se obtienen todos los subArboles que tiene cada padre
    let subTreesParentA = this.getSubTrees(parentA);
    let subTreesParentB = this.getSubTrees(parentB);

    //se elegi del padre B cual es la parte que se va insertar en el hijo 
    let replacement;

    //si el padre B no tiene subArboles entonces se selecciona un nodoTerminal/hoja
    if (subTreesParentB.length !== 0) {
      replacement = subTreesParentB[Math.abs(this.randFloor(0, subTreesParentB.length - 1))];
    } else {
      let indexOptions = [0, 2];
      replacement = parentB[indexOptions[this.randFloor(0, 1)]];//elegir un terminal u otro
    }

    let newChild = parentA.slice();// se crea el hijo nuevo apartir del padre A

    if (subTreesParentA.length !== 0) {
      let selectedNode = subTreesParentA[Math.abs(this.randFloor(0, subTreesParentA.length - 1))];
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

  mutate(mutationRate, newChild) {
    for (let i = 0; i < newChild.length; i++) {
      if (typeof newChild[i] === "object") {
        this.mutate(mutationRate, newChild[i]);
      } else {
        let randomMutationRate = this.rand(0, 1);
        if (randomMutationRate < mutationRate) {
          console.log("MUTATEEE!");

          if (this.isLetter(newChild[i]) || !isNaN(newChild[i])) {
            newChild[i] = this.newNumberOrLetter();
          } else {
            newChild[i] = this.newSign();
          }
        }
      }
    }
    return newChild;
  }

  additionMutate(arrayTree, values) {
    let tempArrayTree = this.verifiedVariables(arrayTree, values);

    if (tempArrayTree.length !== 0) {
      let indexOptions = [0, 2];
      let index = indexOptions[this.randFloor(0, 1)];
      let tempChild = arrayTree[index];

      if (tempArrayTree.length === 1) {
        arrayTree[index] = [tempChild, this.newSign(), tempArrayTree[0]];
      } else {
        arrayTree[index] = [tempChild, this.newSign(), tempArrayTree];
      }
    }
  }

  verifiedVariables(arrayTree, values) {
    let arrayTreeString = JSON.stringify(arrayTree);
    let tempArrayTree = [];

    for (let i = 0; i < values.length; i++) {
      if (arrayTreeString.search(values[i][0]) === -1) {
        console.log("ADDITION!");
        console.log(arrayTreeString);

        if (tempArrayTree.length === 3) {
          tempArrayTree = [[tempArrayTree], this.newSign()];
          let recursiveArrayTree = this.verifiedVariables(arrayTree, values.slice(i, values.length));

          if (recursiveArrayTree.length === 1) {
            tempArrayTree.push(recursiveArrayTree[0]);
          } else {
            tempArrayTree.push(recursiveArrayTree);
          }
          return tempArrayTree;
        } else {
          if (tempArrayTree.length === 1) {
            tempArrayTree.push(this.newSign());
          }
          tempArrayTree.push(values[i][0]);
        }
      }
    }
    return tempArrayTree;
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

  
  //se evalua en la poblacion actual si hay individuos con un fitness perfecto; osea que resuelve lo esperado
  evaluate() {
    for (let i = 0; i < this.population.length; i++) {

      if (this.population[i].fitness === this.perfectScore) {
        this.bestSolution = this.getExpression(this.population[i].arrayTree);
        console.log("BEST SOLUTIOOOOOON! "+ this.bestSolution);

        if (this.bestSolution !== this.getExpression(this.initialPopulation[0].arrayTree)) {
          let all= true;
          let dsLen= this.dataSet[0].length-1;
          let bS;

          for (let i = 0; i < Object.keys(this.dataSet).length; i++) {
            bS= this.bestSolution;

            for (let j = 0; j < this.values.length; j++) {
              let regex = new RegExp(`\\b${this.values[j][0]}\\b`, 'gi');
              bS = bS.replace(regex, this.dataSet[i][j]);
            }

            console.log("Reemplazo en solucion "+bS);
            console.log("*ESPERADO "+dataSet[i][dsLen]);
            console.log("*OBTENIDO "+eval(bS));

            if(dataSet[i][dsLen]!== eval(bS)){
              all= false;
            }
          }

          if(all){
            this.finished = true;
            return;
          }
        }
      }
    }
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

  isLetter(toProve) {
    let letter = false;
    if (toProve.toUpperCase() != toProve.toLowerCase()) {
      letter = true;
    }
    return letter;
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

  getDataSet() {
    let display = "";
    let ecuacion = this.getBestSolution();
    let replacement = "";

    for (let i = 0; i < Object.keys(this.dataSet).length; i++) {
      replacement = ecuacion;

      for (let j = 0; j < this.dataSet[i].length - 1; j++) {
        display += " " + this.variables[j] + "= " + this.dataSet[i][j] + "";
        let regex = new RegExp(`\\b${this.variables[j]}\\b`, 'gi');
        replacement = replacement.replace(regex, dataSet[i][j]);

      }
      display += "<br>" + replacement + " = " + (eval(replacement));
      display += "<br><br>";
    }
    return display;
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