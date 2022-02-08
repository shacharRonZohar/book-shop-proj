'use strict'

// Notes: I was almost done with migration to jQuery then shit started to break so I stopped and reverted some of the changes, not a priority rn
// Sorting by price suddenly broke aswell, couldn't track the exact source at this point,
// It only sorts the last two in the array after the first sort by price
// I'll also make a better design with bootstrap and make tons of refactors when I have time (weekend?)
// I want to be fresh for the super important lesson tmrw and it's 22:00 rn
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

    // Lang select
    $('#lang-select').change(onSetLang)
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
    console.log('sortBy', sortBy)

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

function onSetLang() {
    const lang = $(this).find('option:selected').val()
    setLang(lang);
    if (lang === 'he') $('body').addClass('rtl')
    else $('body').removeClass('rtl')
    doTrans();
}

function doTrans() {
    const $els = $('[data-trans]')
    $els.each(function() {
        const transKey = this.dataset.trans
        const txt = getTrans(transKey)
        if (this.nodeName === 'INPUT') this.placeholder = txt
        else this.innerText = txt
    })
}

function flashMsg(msg) {
    if (getModalState().modal) return
    _toggleModal()
    toggleClass('close-modal', 'open')
    const $elUserMsg = $('.user-msg')
    $elUserMsg.text(msg)
    $elUserMsg.show()
    $('.modal').addClass('delete')
    setTimeout(() => {
        _toggleModal()
        toggleModalIsDelete()
        $elUserMsg.hide()
    }, 2000)
}

function _showBookDetails(book) {
    for (var key in book) {
        if (key === 'id') continue
        const el = document.querySelector(`.modal-${key}`)
        if (key === 'img') {
            el.className = ''
            el.classList.add(`modal-img`)
            el.classList.add(`${book.img}`)
        } else el.innerText = book[key]
    }
}

function _getActionsHtml(book) {
    return `<button data-trans="btn-read" onclick="onReadBook('${book.id}')">Read</button>
    <button data-trans="btn-update" onclick="onUpdateBook('${book.id}')">Update</button>
    <button data-trans="btn-delete" onclick="onDeleteBook('${book.id}')">Delete</button>`
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