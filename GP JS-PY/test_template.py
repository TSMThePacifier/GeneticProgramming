from inspect import signature
import random

#Template del test a ejecutar en archivo generado
test_template = '''def test_case(parameters):

    try:
        test_result = test_funcion(parameters)
        generated_result = generated_function(parameters)
    except:
        print('Someting went wrong')

    if test_result == generated_result:
        print('Test worked!')
        return True

    else:
        print('Test Failed!')
        print('Result of ' + str(test_funcion) + ' = ' + str(test_result))
        print('Result of ' + str(generated_function) + ' = ' + str(generated_result))
        return False

@test_case'''

#Template de funcion de test
test_function_template = '''
from test_template import test_funcion

def generated_function(parameters):

    result = genetic_code

    return result

'''

#Funcion definida por el usuario a ser probada
def ecuacion(numero_1, numero_2, numero_3, numero_4):

    result = numero_1 + numero_2 + numero_3 * numero_4

    return result

#Encargada de reemplazar los inpus, parametros, nombres de funciones y codigo genetico dentro de los templates
def replace_string(inputs, parameters, test_funcion, generated_function, genetic_code, function_template):

    input_string = ''

    for variable in parameters:
        input_string += str(variable) + ', '

    input_string = input_string[:-2]

    input_parameter = ''

    iteration = 0
    while iteration < len(parameters):
        input_parameter += chr(97 + iteration) + ', '
        iteration +=1

    input_parameter = input_parameter[:-2]

    function_template = function_template.replace('inputs', input_string)
    function_template = function_template.replace('parameters', input_parameter)
    function_template = function_template.replace('generated_function', generated_function)
    function_template = function_template.replace('test_funcion', test_funcion)
    function_template = function_template.replace('genetic_code', genetic_code)

    iteration = 0
    test_cases = ''
    while iteration < len(inputs):
        test_string = ', '.join(str(e) for e in inputs[iteration])
        test_cases += 'test_case(' + test_string + ')\n'
        iteration +=1

    input_parameter = input_parameter[:-2]

    function_template = function_template.replace('@test_case', test_cases)

    return function_template

#Prepara el numero de variables, los simbolos a utilizar, los genes iniciales y los datos de prueba
def genetic_setup(test_funcion):

    sig = eval('signature(' + test_funcion + ')')

    number_of_parameters = len(sig.parameters)

    parameters = []

    iteration = 0

    while iteration < number_of_parameters:
        parameters.append(chr(97 + iteration))
        iteration +=1

    symbols = ['+', '-', '/', '*', '(', ')']

    variable = convert_parameters_to_alphabet(parameters)

    genes_iniciales = '0123546789' + variable + '+-*/() '

    data = create_data_set(parameters, test_funcion, True)
    print(data)

    return parameters, symbols, variable, genes_iniciales, data

#Convierte los parametros en el orden de las letras del alfabeto
def convert_parameters_to_alphabet(parameters):
    iteration = 0
    variables = ''
    while iteration < len(parameters):
        variables += chr(97 + iteration)
        iteration +=1

    return variables

#Crea un total de 10 sets de datos de prueba para la funcion
def create_data_set(parameters, function_name, flag):

    iterations = 0
    data = {}

    #Crea 10 sets de datos de prueba diferentes
    while iterations < 10:

        data_set = []

        #Obtiene la cantidad de numeros correspondientes a la cantidad de parametros
        for element in parameters:
            data_set.append(random.randrange(0,100))

        #Les da formato de string separados por coma
        parameters_string = ""
        for element in data_set:
            parameters_string += str(element) + ', '
        parameters_string = parameters_string[:-2]

        #Ejecuta la funcion y guarda el resultado
        resultado = eval(str(function_name) + "( "+ str(parameters_string)+")")

        #Si flag es verdadero, guarda el resultado para compararlo en la creacion del algoritmo genetico
        if flag:
            data_set.append(resultado)

        #Guarda los datos
        data[iterations] = data_set

        iterations+=1

    return data

#Genera el archivo de prueba
def generate_test_file(test_function_template, test_template):

    #Genera el valor inicial de las variables a utilizar en la generacion de codigo genetico
    parameters, symbols, variable, genes_iniciales, data = genetic_setup('ecuacion')

    #Obtiene la mejor solucion a partir del algoritmo genetico
    genetic_code = "a+b+c*d"

    #Obtiene datos de prueba para ejecutar la funcion
    test_data = create_data_set(parameters, 'ecuacion', False)

    #Sustituye valores en el template de la funcion de prueba genetica
    genetic_template = replace_string(test_data, parameters, 'ecuacion', 'genetic_test', genetic_code, test_function_template)

    #Sustituye valores en el template de funcion de prueba
    new_template = replace_string(test_data, parameters, 'ecuacion', 'genetic_test', '', test_template)

    print(genetic_template)
    print(new_template)

    #Genera el archivo de pruebas
    fname = 'generated_test.py'
    data_for_template = genetic_template + new_template

    with open(fname, 'w') as f:
        f.write('{}'.format(data_for_template))
    
    
def generate_test_information(function_name):
    _, _, _, _, data = genetic_setup(function_name)
    return data

#generate_test_file(test_function_template, test_template)

