'use strict'

const STORAGE_KEY = 'booksDB'
const PAGE_SIZE = 3
const WHITESPACE_REGEX = /\s/g

var gBooks
var gCurrBook
var gIsModalOpen = { modal: false, delete: false }
var gSortBy = { sortBy: 'title', isAsc: true }
var gPageIdx = 0
_createBooks()

function gotoPage(pageIdx) {
    gPageIdx = pageIdx
}

function addBook(bookName, bookPrice) {
    gBooks.unshift(_createBook(bookName, bookPrice))
    _saveBooksToStorage()
}

function removeBook(bookId) {
    // TODO: Change to filter()
    if (gBooks.length === 1) gBooks = []
    else gBooks.splice(gBooks.findIndex(book => book.id === bookId), 1)
    _saveBooksToStorage()
}

function updateBook(bookId, newPrice) {
    getBookFromId(bookId).price = newPrice
}

function changeRate(diff) {
    if (diff > 0 && gCurrBook.rate === 10 ||
        diff < 0 && gCurrBook.rate === 0) return
    gCurrBook.rate += diff
}

function getBookFromId(bookId) {
    return gBooks.find(book => bookId === book.id)
}

function getBooks() {
    var books = JSON.parse(JSON.stringify(gBooks))
    const startIdx = gPageIdx * PAGE_SIZE
    books.autoSortObj(gSortBy.sortBy, gSortBy.sortBy === 'title' ? '' : 0, gSortBy.isAsc)
    return books.slice(startIdx, startIdx + PAGE_SIZE)
}

function getPagesNum() {
    return gBooks.length / PAGE_SIZE
}

function checkIfLastPage(diff) {
    if ((gPageIdx + diff) * PAGE_SIZE < 0 ||
        (gPageIdx + diff) * PAGE_SIZE >= gBooks.length) return true
    else return false
}


function setCurrBook(bookId) {
    gCurrBook = bookId
}

function getCurrBook() {
    return gCurrBook
}

function getModalState() {
    return gIsModalOpen
}

function toggleModalState() {
    gIsModalOpen.modal = !gIsModalOpen.modal
}

function toggleModalIsDelete() {
    gIsModalOpen.delete = !gIsModalOpen.delete
}

function setSortBy(sortBy) {
    gSortBy.isAsc = !gSortBy.isAsc
    gSortBy.sortBy = sortBy
}

function changePage(diff) {
    gPageIdx += diff
}

function getPages() {
    return { currPageIdx: gPageIdx, pageSize: PAGE_SIZE }
}

function _createBooks() {
    var books = loadFromStorage(STORAGE_KEY)
    if (!books || !books.length) {
        books = [
            _createBook('Das Kapital', undefined, 'Karl Marx'),
            _createBook('The Conquest of Bread', undefined, 'Peter Kropotkin'),
            _createBook('The Ego and His Own', undefined, 'Max Stirner'),
            _createBook('The Struggle Against the State and Other Essays', undefined, 'Nestor Makhno'),
            _createBook('Coraline', undefined, 'Neil Gaiman')
        ]
    }
    gBooks = books
    _saveBooksToStorage()
}

function _createBook(title, price = getRandomInt(1, 101), author = 'anonymous') {
    return {
        id: makeId(9),
        title,
        price,
        author,
        img: _getImgClass(title),
        details: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean ut nulla sem. Nunc posuere turpis non sapien rhoncus tincidunt. Vivamus volutpat dignissim ante, et commodo magna molestie a. Integer vitae nulla massa. Duis et massa vulputate, sodales ligula at, consequat turpis. Suspendisse enim est, efficitur in nisl nec, fermentum sodales metus. Ut dolor diam, tempor at orci a, vehicula interdum tortor. Ut vel magna rutrum, mattis enim nec, lobortis sapien. Nulla facilisi. Aliquam interdum ex dictum, aliquet purus at, aliquet nibh. Ut eleifend ligula quis magna sollicitudin aliquam. Nulla viverra nunc justo, at finibus velit maximus eget.',
        rate: 0
    }
}

function _saveBooksToStorage() {
    saveToStorage(STORAGE_KEY, gBooks)
}

function _getImgClass(title) {
    return title.replace(WHITESPACE_REGEX, '-').toLowerCase()
}