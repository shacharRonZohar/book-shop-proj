'use strict'

function saveToStorage(key, val) {
    localStorage.setItem(key, JSON.stringify(val))
}

function loadFromStorage(key) {
    return JSON.parse(localStorage.getItem(key))
}