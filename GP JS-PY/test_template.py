from inspect import signature, getsource
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
        print('Result of test_funcion = ' + str(test_result))
        print('Result of generated_function = ' + str(generated_result))
        return False

@test_case'''

#Template de funcion de test
test_function_template = '''
def generated_function(parameters):

    result = genetic_code

    return result

'''

#Funcion definida por el usuario a ser probada
def ecuacion(a, b, c, d, e):

    result = a + b + c * d / e

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

#Prepara el numero de parametros y los datos de prueba
def genetic_setup(test_funcion):

    sig = eval('signature(' + test_funcion + ')')

    number_of_parameters = len(sig.parameters)

    parameters = []

    iteration = 0

    while iteration < number_of_parameters:
        parameters.append(chr(97 + iteration))
        iteration +=1

    data = create_data_set(parameters, test_funcion, True)

    data['Function'] = get_users_executable_code(ecuacion)

    return parameters, data

#Obtiene el codigo ejecutable de la funcion programada por el ususario
def get_users_executable_code(funtion_name):

    function_code = getsource(funtion_name).splitlines()

    executable_code = function_code[2].rsplit('= ', 1)

    return executable_code[1]

#Genera los datos de prueba para enviar al algoritmo genetico
def generate_test_information(function_name):

    _, data = genetic_setup(function_name)

    return data

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

#Obtiene la funcion programada por el usuario
def get_user_code(function_name):

    return getsource(function_name)

#Genera el archivo de prueba
def generate_test_file(test_function_template, test_template):

    #Genera el valor inicial de las variables a utilizar en la generacion de codigo genetico
    parameters, data = genetic_setup('ecuacion')

    #Obtiene la mejor solucion a partir del algoritmo genetico
    genetic_code = ((getsource(ecuacion).splitlines())[2].rsplit('= ', 1))[1]

    #Obtiene datos de prueba para ejecutar la funcion
    test_data = create_data_set(parameters, 'ecuacion', False)

    #Sustituye valores en el template de la funcion de prueba genetica
    genetic_template = replace_string(test_data, parameters, 'ecuacion', 'genetic_test', genetic_code, test_function_template)

    #Sustituye valores en el template de funcion de prueba
    new_template = replace_string(test_data, parameters, 'ecuacion', 'genetic_test', '', test_template)

    #Genera el archivo de pruebas
    fname = 'generated_test.py'
    user_function = get_user_code(ecuacion)
    data_for_template = user_function + genetic_template + new_template

    with open(fname, 'w') as f:
        f.write('{}'.format(data_for_template)) 

generate_test_file(test_function_template, test_template)
generate_test_information('ecuacion')