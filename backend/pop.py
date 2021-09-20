# Author BRNBRIK Mouad

# import libraries
import os
import requests
import json
from openpyxl import load_workbook

api_url = 'http://10.0.0.128:1337/api/inventory/'
pole_url = api_url + 'pole/'
division_url = api_url + 'division/'
function_url = api_url + 'function/'
employee_url = api_url + 'employee/'

cwd = os.getcwd()
data_file = 'bd users.xlsx'
wb = load_workbook(data_file)
employee_sheet = wb['Users']

token = 'Bearer ' + requests.post('http://10.0.0.128:1337/auth/login/', {
    'username': 'admin',
    'password': 'admin',
}).json()['access_token']
headers = {"Authorization": token}


def create(_list, url, value, key='name'):
    for _pole in _list.json():
        if _pole[key] == value:
            return _list
    requests.post(url, {key: value}, headers=headers)
    return requests.get(url)


def exist(identifier, last_name, first_name):
    _json = {'identifier': str(identifier),
             'first_name__icontains': first_name,
             'last_name__icontains': last_name
             }
    resp = requests.post(employee_url + 'filter/', json=_json, headers=headers)
    if resp.status_code == 200:
        return True
    return False


def get_id(_list, value, key=''):
    for item in _list.json():
        item = list(item.values())
        if value == item[0]:
            return item[1]
    return None


def pop_employee():
    print('populating employee....')
    poles = requests.get(pole_url)
    divisions = requests.get(division_url)
    functions = requests.get(function_url)
    employees = requests.get(employee_url, headers=headers)
    line = 0
    for identifier, last_name, first_name, pole, division, function in employee_sheet:
        if line == 0:
            line += 1
        else:
            function.value = " ".join(function.value.split())
            division.value = " ".join(division.value.split())
            pole.value = " ".join(pole.value.split())
            poles = create(poles, pole_url, pole.value)
            divisions = create(divisions, division_url, division.value)
            functions = create(functions, function_url, function.value)
            # print(get_id(poles, pole.value),get_id(divisions, division.value),get_id(functions, function.value),
            # function.value)
            if not identifier.value:
                identifier.value = '####'
            if not exist(identifier.value, last_name.value, first_name.value):
                # print('creating employee with identifier: ' + str(identifier.value))
                employee = {
                    'identifier': identifier.value,
                    'last_name': last_name.value,
                    'first_name': first_name.value,
                    'pole': get_id(poles, pole.value),
                    'division': get_id(divisions, division.value),
                    'function': get_id(functions, function.value)
                }
                resp = requests.post('http://10.0.0.128:1337/api/inventory/employee/', json=employee, headers=headers)
                if resp.status_code == 200:
                    print(employee)
    print('populating employee has finished.')


if __name__ == '__main__':
    pop_employee()
