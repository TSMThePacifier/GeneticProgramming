import datetime
import random
startTime = datetime.datetime.now()

def calculate_wide_result(expected_result):

    return abs(expected_result / 3)

def calculate_expected_result(data, parameters, data_index):

    return data[data_index][len(parameters)]

#Remplaza los parametros por sus valores numericos, le asigna un valor al fitness dependiendo de la cantidad de parametros
def replace_parameters_in_string(original_string, data, data_index, parameters, fitness):

    all_parameters = True

    value = -1
    for i in parameters:
        value+=1
        if i in original_string:
            original_string = original_string.replace(i, str(data[data_index][value]))
            fitness += 5
        else:
            all_parameters = False
            break

    return original_string, fitness, all_parameters

#Formatea el string con espacion entre caracteres
def format_spaces_in_string(original_string):

    formatted_string = original_string

    formatted_string = ' '.join([formatted_string[i:i+1] for i in range(0, len(formatted_string), 1)])

    return formatted_string

#Chequea si los genes son compilables, y si el resultado se acerca al esperado
def resultado_function(data, parameters, data_index, function, fitness):

    expected_result = calculate_expected_result(data, parameters, data_index)

    wide_result = calculate_wide_result(expected_result)

    resultado_funcion = eval(function)
    fitness +=2000

    if (expected_result -wide_result) <= int(resultado_funcion) <= (expected_result+wide_result):
        fitness +=8000

        if int(resultado_funcion) == expected_result:

            print(str(function) + ' = ' + str(resultado_funcion))
            fitness +=50000

    return fitness

#Calcula el fitness de la solucion, mienstras mas se acerque al resultado deseado mayor el fitness
def calcular_fitness(data, parameters, symbols, genes):

    fitness = 0

    #Obtiene los genes en formato de string con espacios
    test = format_spaces_in_string(genes)

    try:

        #Set de prueba a utilizar
        data_test = 0

        #Replaza los parametros por valores numericos para la ejefucion de la funcion
        test, fitness, parameters_presence = replace_parameters_in_string(test, data, data_test, parameters, fitness)

        #En caso de faltar parametros, devuelve el fitness actual
        if not parameters_presence:
            return fitness

        #Suma 5 puntos al fitnes por cada simbolo matematico encontrado
        for operator in symbols:
            fitness +=(test.count(operator)* 5)

        #Calcula el fitness basandose en si los genes son compilables, y si se acercan al resultado esperado
        fitness = resultado_function(data, parameters, data_test, test, fitness)

        #Si el fitness es mayor a 50000, significa que los genes son compilables y el set de pruebas consiguio el resultado esperado
        if fitness > 50000:

            test_case = 0

            #Repite el proceso de verificacion con los 10 casos de prueba
            while test_case < len(data):

                new_test_case = format_spaces_in_string(genes)

                new_test_case, fitness, _ = replace_parameters_in_string(new_test_case, data, test_case, parameters, fitness)

                fitness += resultado_function(data, parameters, test_case, new_test_case, fitness)
                test_case +=1

            #Si todos los casos de prueba obtienen el resultado correcto, detiene la ejecucion
            if test_case == 10:
                fitness = 123456789

    except:
        pass

    return fitness

#Crea de forma random un conjunto de genes padres
def generar_padre(genes_iniciales, length):

    genes = []

    #Se crea una cadena al azar del largo definido
    while len(genes) < length:
        tamano = min(length - len(genes), len(genes_iniciales))

        #Seleccion aleatoria de genes
        genes.extend(random.sample(genes_iniciales,tamano))

    #Se hace return en forma de string
    return ''.join(genes)

#Realiza la mutacion de genes
def realizar_mutacion(genes_iniciales, padre):

    #Escoge uno gen random para mutar
    index = random.randrange(0,len(padre))

    #Guardamos los genes originales del padre
    genes_hijo = list(padre)

    #Se escoje 2 genes aleatorios, en caso de que la primera opcion sea igual al gen original
    gen_nuevo, alternativa = random.sample(genes_iniciales,2)

    #Si el gen nuevo es diferente al original, lo intercambia
    if gen_nuevo == genes_hijo[index]:
        genes_hijo[index] = alternativa
    else:
    #Si el gen nuevo es igual al original, lo intercambia por la alternativa
        genes_hijo[index] = gen_nuevo

    return ''.join(genes_hijo)

#Funcion para imprimir en pantalla los resultados
def display(genes, fitness):
    timeDiff = datetime.datetime.now() - startTime
    print('{}\t{}\t{}'.format(genes,fitness,timeDiff))

#Creamos un ciclo para iterar nuestras funciones
#Hasta obtener nuestro target

def get_best_solution(parameters, symbols, variable, genes_iniciales, data):

    #Realiza la prueba con 40 seeds diferentes de forma consecutiva
    random_seed = 0
    while random_seed < 40:
        random.seed(random_seed)
        random_seed +=1

        #La cantidad de genes por seed va desde 5 hasta 15
        cantidad_de_genes = 5
        while cantidad_de_genes < 15:

            #Inicializa el padre y calcula su fitness
            mejor_padre = generar_padre(genes_iniciales, cantidad_de_genes)
            mejor_fitness = calcular_fitness(data, parameters, symbols, mejor_padre)

            display(mejor_padre, mejor_fitness)

            cantidad_de_genes+=1

            #Realiza 1000 ejecuciones por cada cantidad de genes
            ejecuciones = 0

            while ejecuciones<1000:
                ejecuciones +=1

                #Realiza la mutacion del padre y calcula su fitness
                hijo = realizar_mutacion(genes_iniciales, mejor_padre)
                fitness_hjjo = calcular_fitness(data, parameters, symbols, hijo)

                #Chequea que la mutacion haya aumentado el mejor fitness actual
                if mejor_fitness >= fitness_hjjo:
                    continue

                display(hijo, fitness_hjjo)

                #En caso de ser la solucion con todos los escenarios probados correctos, termina el ciclo
                if int(fitness_hjjo) == 123456789:
                    print('Seed: ', random_seed)
                    print('cantidad de genes: ', cantidad_de_genes)
                    print('Ejecucion: ', ejecuciones)
                    ejecuciones = 1000
                    random_seed = 41
                    cantidad_de_genes = 21

                    return hijo

                #Se actualiza el mejor fitness en caso de ser mayor
                mejor_fitness = fitness_hjjo

                #El mejor set de genes hijo se convierte en padre
                mejor_padre = hijo