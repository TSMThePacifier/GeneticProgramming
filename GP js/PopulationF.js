class Population {
  
  //constructor que inicializa la poblacion
    constructor(res, pmax, mut, iniPop) {
      this.iniPop= iniPop;
       this.result= res;
       this.popMax= pmax;
       this.mutationRate = mut; 
       this.population = [];
   
       this.matingPool = []; 
       this.generations = 0; 
       this.perfectScore = 100;   
       this.best = "";      
       this.finished = false;  
      
       //se recorre la poblacion inicial dada y se guarda
        for (let i = 0; i < iniPop.length; i++) {
        iniPop[i].arrayTree= this.treeToArray(iniPop[i]);
        this.population[i] = new Tree(iniPop[i].value, iniPop[i].child);
        this.population[i].arrayTree= iniPop[i].arrayTree;
        this.population[i].calcFitness(this.getTreeResult(this.population[i].arrayTree),this.result);
      }
     }

    //convierte un arbol en un arreglo para su más facil manejo
    treeToArray(tree){ 
      let fullTree=[];
      for (let i = 0; i < tree.child.length; i++) {      
          if(typeof tree.child[i]=== "object"){// si es object es un subarbol sino es solo un nodoTerminal/hoja
              fullTree.push(this.treeToArray(tree.child[i])); //se usa recursividad para recorrer subArboles del arbol original
          }else{
              fullTree.push(tree.child[i]);               
          }
  
          if(i===0){
              fullTree.push(tree.value);
          } 
      }
      return fullTree;
    }

    //se calcula el resultado de la solucion para un arbol 
  getTreeResult(arrayTree){ 
      let fullTree="(";
      for (let i = 0; i < arrayTree.length; i++) {    
          if(typeof arrayTree[i]=== "object"){
              fullTree+=this.getTreeResult(arrayTree[i]); 
          }else{
              fullTree+=arrayTree[i];               
          }
      }
      fullTree+=")";  
      let e=eval(fullTree);
      if(e<0){
        e="("+e+")"; //si el numero es negativo se devuelve con parentesis para evitar errores en le calculo
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
      let newPop=[];

       for (let i = 0; i < this.popMax; i++) {
        let partnerA = this.matingPool[this.randFloor(0,this.matingPool.length-1)];
        let partnerB = this.matingPool[this.randFloor(0,this.matingPool.length-1)];
        
        console.log("partnerA");
        console.log(partnerA);
        console.log("partnerB");
        console.log(partnerB);

        let child = this.crossover(partnerA.arrayTree,partnerB.arrayTree);

         console.log("newChild");
         console.log(child);

         this.mutate(this.mutationRate,child);
         
         console.log("childmutate");
         console.log(child);

         let tree= this.arrayToTree(child);//se transforma el nuevo hijo que es un array en un arbol
         tree.arrayTree= child;

         tree.calcFitness(this.getTreeResult(child),this.result);
         newPop.push(tree);
       }
       this.population= newPop; //se reemplaza la antigua poblacion
       this.generations++;
     }

    //se hace un cruce de un padre A con un padre B para generar un nuevo hijo
    crossover(partnerA, partnerB) {

      //se obtienen todos los subArboles que tiene cada padre
      let pA= this.getSubTrees(partnerA);
      let pB= this.getSubTrees(partnerB); 
  
      //se elegi del padre B cual es la parte que se va insertar en el hijo 
      let replacement;

      //si el padre B no tiene subArboles entonces se selecciona un nodoTerminal/hoja
      if(pB.length!==0){
          replacement= pB[Math.abs(this.randFloor(0,pB.length-1))]; 
      }else{
          let indexOptions=[0,2];     
          replacement= partnerB[indexOptions[this.randFloor(0,1)]];//elegir un terminal u otro
      }
  
      let newChild= partnerA.slice();// se crea el hijo nuevo apartir del padre A
  
      if(pA.length!==0){
          let selectedNode= pA[Math.abs(this.randFloor(0,pA.length-1))];        
          let stringChild = JSON.stringify(newChild);

          //se reemplaza en el nuevo hijo una parte extraida del padre B
          let modifiedChild= stringChild.replace(JSON.stringify(selectedNode),JSON.stringify(replacement)); 
          newChild= JSON.parse(modifiedChild);
      }else{
          let indexOptions=[0,2];
          newChild[indexOptions[this.randFloor(0,1)]] = replacement; 
      }
      return newChild;
    }  

    mutate(mutationRate, arrayTree){
      for (let i = 0; i < arrayTree.length; i++) {   
          if(typeof arrayTree[i]=== "object"){
              this.mutate(mutationRate,arrayTree[i]); 
          }else{
              let randM= this.rand(0,1);

              console.log("mutateProbability "+randM);
              console.log(arrayTree[i]);

              if (randM < mutationRate) {

                  console.log("MUTATE!!!");

                  if(isNaN(arrayTree[i])){
                      arrayTree[i] = this.newSign();
                  }else{
                      arrayTree[i] =this.randFloor(0,9).toString();
                  }
                }          
          }
      }
     return arrayTree;
  }

  //se obtienen los subArboles que tiene un arbol en su totalidad
  getSubTrees(arrayTree){    
      let subTrees=[];
  
      for (let i = 0; i <arrayTree.length; i++) {        
              if(typeof arrayTree[i]=== "object"){
                  subTrees.push(arrayTree[i]);
                  let tree= this.getSubTrees(arrayTree[i]);  
                  if(tree.length!==0){
                      subTrees.push(tree[0]);
                  }                      
              }    
      }
      return subTrees;
  }
  
//se convierte un array en un nuevo arbol
arrayToTree(arrayTree){ 
  let tree;
  let child=[];
  let value="";

  for (let i = 0; i < arrayTree.length; i++) {
      if(typeof arrayTree[i]=== "object"){
         child.push(this.arrayToTree(arrayTree[i]));
      }else{            
          if(i===1){
              value= arrayTree[i];
          } else{
              child.push(arrayTree[i]); 
          }             
      }
  }
  tree= new Tree(value,child);
  return tree;
}

//se genera un nuevo signo aleatorio
newSign() {  
  let signs = ['-','*','/',"+"];   
  let s = this.randFloor(0,signs.length-1);  
  return signs[s];
}

//se genera un numero aleatoria entero
randFloor(min,max){    
  return Math.floor(Math.random() * (+max + 1 - +min)) + +min; 
}

//se genera un numero aleatorio decimal
rand(min,max){    
  return Math.random() * (+max - +min) + +min; 
}

//se evalua en la poblacion actual si hay individuos con un fitness perfecto; osea que resuelve lo esperado
 evaluate() {

  let found=false;
  let worldrecord = 0.0;
  for (let i = 0; i < this.population.length; i++) {

    if (this.population[i].fitness >= worldrecord) {
      worldrecord = this.population[i].fitness;

      if (worldrecord === this.perfectScore) {
        this.best +=this.getExpression(this.population[i].arrayTree)+"<br>";
        found=true;
      }
    }    
  } 

  if(found){
    this.finished = true;
  }
}

//se obtiene la funcion almacenada en el arbo; ejm: (2*5)
  getExpression(arrayTree){ 
    let fullTree="(";
    for (let i = 0; i < arrayTree.length; i++) {    
      if(typeof arrayTree[i]=== "object"){
        fullTree+=this.getExpression(arrayTree[i]); 
      }else{
        fullTree+=arrayTree[i];               
      }
    }
      fullTree+=")";
      return fullTree;
    }

    //se obtienen el numero de generaciones creadas
    getGenerations() {
      return this.generations;
    } 
    
    //se obtienen las mejores soluciones 
    getBest() {
      return this.best;
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
         everything += " = "+this.getTreeResult(this.population[i].arrayTree) + "<br>";
       }
       return everything;
     }

     //se obtienen las funciones de la poblacion inicial
     initialExpressions() {
      let everything = "";   
  
      for (let i = 0; i < this.iniPop.length; i++) {
        everything += this.getExpression(this.iniPop[i].arrayTree);
        everything += " = "+this.getTreeResult(this.iniPop[i].arrayTree) + "<br>";
      }
      return everything;
    }
   }