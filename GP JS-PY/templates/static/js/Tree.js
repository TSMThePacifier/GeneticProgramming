class Tree {

    //constructor mediante el que se crea un arbol
     constructor(value, child) {   
        this.value=value;//nodo padre
        this.child=child;//nodos hijos
        this.fitness=0;
        this.arrayTree= [];//mismo arbol en formato array
        this.expression= "";
    }


    calcFitness(treeResult,expectedResult) {
        console.log(treeResult);
        let score = 0;
        let calculation= expectedResult.toString()+"-"+treeResult.toString(); //se convierte a string para que eval()pueda manejar los parentesis
        let difference= Math.abs(eval(calculation));//esperado - obtenido
        
        if(difference>100){
            score= 0;
        }else{
            score=100-difference;
        }
        this.fitness= score;
      }
}