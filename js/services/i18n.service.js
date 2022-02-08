'use strict'
var gCurrLang = 'en'

const gTrans = {
    title: {
        en: 'Welcome to your bookshop!',
        he: 'ברוך הבא לחנות הספרים שלך!'
    },
    'tableh-id': {
        en: 'ID',
        he: 'ת"ז'
    },
    'tableh-title': {
        en: 'Title',
        he: 'כותרת'
    },
    'tableh-price': {
        en: 'Price',
        he: 'מחיר'
    },
    'tableh-actions': {
        en: 'Actions',
        he: 'פעולות'
    },
    'btn-create-book': {
        en: 'Create new book',
        he: 'צור ספר חדש'
    },
    'btn-clear-storage': {
        en: 'Clear Storage',
        he: 'נקה אחסון'
    },
    'btn-read': {
        en: 'Read',
        he: 'קרא'
    },
    'btn-update': {
        en: 'Update',
        he: 'עדכן'
    },
    'btn-delete': {
        en: 'Delete',
        he: 'מחק'
    },
    'btn-close': {
        en: 'Close',
        he: 'סגירה'
    },
    'btn-confirm': {
        en: 'Confirm',
        he: 'אשר'
    },
    'btn-add-book': {
        en: 'Add Book',
        he: 'הוסף ספר'
    },
    author: {
        en: 'Author:',
        he: ':מחבר'
    },
    'input-book-name': {
        en: 'Enter the book\'s name',
        he: 'הכנס את שם הספר'
    },
    'input-book-price': {
        en: 'Enter the book\'s price',
        he: 'הכנס את מחיר הספר'
    },
    'input-book-price-up': {
        en: 'Enter the book\'s new price',
        he: 'הכנס את המחיר החדש של הספר'
    },
    'not-allowed-msg': {
        en: 'You\'re not allwoed to do that',
        he: 'אתה לא יכול לעשות את זה!'
    }
}

function getTrans(transKey) {
    const keyTrans = gTrans[transKey]
    if (!keyTrans) return 'UNKNOWN'
    var txt = keyTrans[gCurrLang]
    if (!txt) txt = keyTrans.en
    return txt
}


function setLang(lang) {
    gCurrLang = lang;
}