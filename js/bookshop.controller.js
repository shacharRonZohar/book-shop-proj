'use strict'

$(onInit)

function onInit() {
    setEventListeners()
    renderBooks()
    _createPagesNav()
}

function setEventListeners() {
    // Static btns
    $('#btn-clear-storage').click(resetLocalStorage)
    $('#btn-create-book').click(onCreateBook)
    $('#btn-add-book').click(onAddBook)
    $('#btn-confirm-update').click(onConfirmUpdate)
    $('#btn-change-rate-minus').click(-1, onChangeRate)
    $('#btn-change-rate-plus').click(1, onChangeRate)
    $('.close-modal').click(onCloseModal)

    // Table headers (for sorting)
    $('#header-title').click('title', onSortBy)
    $('#header-price').click('price', onSortBy)
}

function renderBooks() {
    // The keys for the table headers, corresponding to the object keys
    const valueOpts = ['id', 'title', 'price']

    // Gets the books according to the current sorting 
    const books = getBooks()

    // Reset the static table container
    const elTable = document.querySelector('.table-container')
    elTable.innerHTML = ''

    books.forEach(book => {
        // Insert a tr element inside the table
        const elRow = elTable.insertRow()

        // Iterate over the table headers key per book
        valueOpts.forEach((opt, optIdx) => {
            const elCell = elRow.insertCell()
            elCell.innerText = book[opt]
            elCell.classList.add(opt)
            if (optIdx === valueOpts.length - 1) {
                // If the current iteration is the last in the array,
                // insert another cell and add the actions html to it 
                const elActionsCell = elRow.insertCell()
                elActionsCell.innerHTML = _getActionsHtml(book)
                elActionsCell.classList.add('actions')
            }
        })
    })
}

function onCreateBook() {
    if (getModalState().modal) return
    _toggleModal()
    toggleClass('new-book', 'open')
}

function onAddBook() {
    const bookName = $(`input[name="book-name"]`).val().trim()
    const bookPrice = $(`input[name="book-price"]`).val().trim()
    if (!bookName || !bookPrice || isNaN(bookPrice)) return flickerClass('not-allowed-msg', 'open')
    addBook(bookName, bookPrice)
    renderBooks()
    _createPagesNav()
    _toggleModal()
    toggleClass('new-book', 'open')
}

function onDeleteBook(bookId) {
    if (getModalState().modal) return
    toggleModalIsDelete()
    removeBook(bookId)
    if (!getBooks().length) changePage(-1)
    _createPagesNav()
    renderBooks()
    flashMsg(`Book Deleted`)
}

function onReadBook(bookId) {
    if (getModalState().modal) return
    const book = getBookFromId(bookId)
    setCurrBook(book)
    _showBookDetails(book)
    _toggleModal()
    toggleClass('read-book', 'open')
}

function onUpdateBook(bookId) {
    if (getModalState().modal) return
    setCurrBook(bookId)
    _toggleModal()
    toggleClass('update-book', 'open')
}

function onConfirmUpdate() {
    const bookPrice = $(`input[name="book-new-price"]`).val()
    if (!bookPrice || isNaN(bookPrice)) return flickerClass('not-allowed-msg', 'open')
    updateBook(getCurrBook(), bookPrice)
    renderBooks()
    _toggleModal()
}

function onCloseModal() {
    _toggleModal()
}

function onChangeRate(ev) {
    const diff = ev.data
    changeRate(diff)
    _renderRate()
}

function onSortBy(ev) {
    var sortBy = ev.data
    setSortBy(sortBy)
    renderBooks()
}

function onChangePage(elBtn, diff) {
    if (checkIfLastPage(diff)) return
    changePage(diff)
    renderBooks()
    _changeBtns(false)
    _disableCurrPageBtn()
    if (checkIfLastPage(diff)) elBtn.disabled = true
}

function onGotoPage(elBtn, pageIdx) {
    _changeBtns(false)
    elBtn.disabled = true
    gotoPage(pageIdx)
    renderBooks()
}

function flashMsg(msg) {
    if (getModalState().modal) return
    _toggleModal()
    document.querySelector('.close-modal').style.display = 'none'
    const el = document.querySelector('.user-msg')
    el.innerText = msg
    el.classList.add('open')
    document.querySelector('.modal').classList.add('delete')
    setTimeout(() => {
        _toggleModal()
        toggleModalIsDelete()
        el.classList.remove('open')
        document.querySelector('.close-modal').style.display = 'inline'
    }, 2000)
}

function _showBookDetails(book) {
    for (var key in book) {
        if (key === 'id') continue
        const el = document.querySelector(`.${key}`)
        if (key === 'img') {
            el.className = ''
            el.classList.add(`img`)
            el.classList.add(`${book[key]}`)
        } else el.innerText = book[key]
    }
}

function _getActionsHtml(book) {
    return `<button onclick="onReadBook('${book.id}')">Read</button>
    <button onclick="onUpdateBook('${book.id}')">Update</button>
    <button onclick="onDeleteBook('${book.id}')">Delete</button>`
}

function _toggleModal() {
    _resetModal()
    toggleModalState()
    toggleClass('modal', 'open')
    if (getModalState().delete) toggleClass('modal', 'delete')
}

function _resetModal() {
    document.querySelectorAll('.modal>*').forEach(el => el.classList.remove('open'))
}

function _renderRate() {
    document.querySelector('.rate').innerText = getCurrBook().rate
}

function _changeBtns(isDisable) {
    document.querySelectorAll('.change-btn').forEach(elBtn => elBtn.disabled = isDisable)
}

function _changeBinaryBtn(selector, isDisable) {
    document.querySelector(`.${selector}`).disabled = isDisable
}

function _createPagesNav() {
    document.querySelector('.page-nav').innerHTML = ''
    const numOfPages = getPagesNum()
    const el1stBtn = _makePageBtn('prev', true)
    if (getPages().currPageIdx === 0) el1stBtn.disabled = true
    _addBinaryBtnClasses(el1stBtn, 'prev')
    for (let i = 0; i < numOfPages; i++) {
        const elBtn = _makePageBtn(i, false)
        elBtn.classList.add('change-btn')
            // elBtn.dataset.id = i
        if (i === getPages().currPageIdx) elBtn.disabled = true
    }
    const elLastBtn = _makePageBtn('next', true)
    if (getPagesNum() === 1) elLastBtn.disabled = true
    _addBinaryBtnClasses(elLastBtn, 'next')
}

function _makePageBtn(conts, isBinary) {
    const elBtnSect = document.querySelector('.page-nav')
    const elBtn = document.createElement('button')
    elBtn.innerText = (conts === 'prev') ? '<<' : (conts === 'next') ? '>>' : conts + 1
    elBtn.onclick = (isBinary) ? function() { onChangePage(this, (conts === 'prev') ? -1 : 1) } : function() { onGotoPage(this, conts) }
    elBtnSect.appendChild(elBtn)
    return elBtn
}

function _addBinaryBtnClasses(elBtn, direction) {
    elBtn.classList.add('change-btn')
    elBtn.classList.add('binary')
    elBtn.classList.add(direction)
}

function _disableCurrPageBtn() {
    const currPageIdx = getPages().currPageIdx
    document.querySelector('.page-nav').children.item(currPageIdx + 1).disabled = true
}