class Tree {

    //constructor mediante el que se crea un arbol
     constructor(value, child,arrayTree) {   
        this.value=value;//nodo padre
        this.child=child;//nodos hijos
        this.fitness=0;
        this.arrayTree= [];//mismo arbol en formato array
        this.expression= "";
    }


    calcFitness(treeResult,expectedResult) {
        let score = 0;
        let calc= expectedResult.toString()+"-"+treeResult.toString(); //se convierte a string para que eval()pueda manejar los parentesis
        let far= Math.abs(eval(calc));//esperado - obtenido
        
        if(far>100){
            score= 0;
        }else{
            score=100-far;
        }
        this.fitness= score;
      }
}