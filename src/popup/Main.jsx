import React, { useState, useEffect } from 'react'

// 북마크 목록 가져오기

const Main = () => {
  const [bookmarks, setBookmarks] = useState([])

  const getBookmarks = () => {
    return new Promise((resolve, reject) => {
      chrome.bookmarks.getTree(function (bookmarkTreeNodes) {
        resolve(bookmarkTreeNodes)
      })
    })
  }

  const updateBookMarks = async (bookmark, newIndex) => {
    const fixedId = JSON.parse(window.localStorage.getItem('fixedId') || '[]')
    const bookmarkIdCompare = fixedId.find((item) => item === bookmark) !== undefined
    console.log('북마크 막았??', bookmarkIdCompare)

    if (bookmarkIdCompare === true) {
      console.log('북마크 막았?')
      return
    }

    // console.log('확인하기', fixedCnt, '확인 뉴', newIndex)
    // let indexFilter = Number(fixedCnt) + newIndex

    console.log('업데이트 진행', newIndex)
    chrome.bookmarks.move(
      bookmark.id,
      {
        index: newIndex,
      } , // 새로운 인덱스를 지정
      function (updatedBookmark) {
        if (chrome.runtime.lastError) {
          console.error('북마크 업데이트 오류:', chrome.runtime.lastError)
          return
        }
        console.log('북마크가 성공적으로 업데이트되었습니다:', updatedBookmark)
      },
    )
    console.log('북마크 최종 : ', bookmarks)
  }

  const searchBookmarks = async (bookMarkWord) => {
    const fixedCnt = window.localStorage.getItem('fixedCnt')

    if (bookMarkWord === '') {
      getBookMarksCode()
      return
    }

    await chrome.bookmarks.search(bookMarkWord, function (results) {
      // 검색 결과 출력
      console.log('검색된 북마크들:', results)
      setBookmarks(results)

      if (results.length > 0) {
        // 각 북마크의 인덱스를 임시로 변경하고 원래 순서로 되돌리기
        results.map((bookmark, index) => {
          const originalIndex = bookmark.index // 원래 인덱스 저장
          console.log(`본래의 인덱스 for ${bookmark.title}: `, originalIndex)

          // 변경할 새로운 인덱스를 계산 (현재는 임시로 순서대로 1씩 증가시킴)
          const newIndex = Number(fixedCnt) + index // 순서대로 인덱스를 변경

          console.log(`인덱스를 ${originalIndex}에서 ${newIndex}로 변경`)

          console.log('북마크 아이디 보기', bookmark.id)
          updateBookMarks(bookmark, newIndex)
        })
        // getBookMarksCode()
      }
    })
  }

  const setBookMarkSearchWord = () => {
    const text = document.getElementById('searchText') 
    const textValue = text.value

    window.localStorage.setItem('bookmarkkey', textValue)
    searchBookmarks(textValue)
  }

  const getBookMarksCode = () => {
    console.log('초기')
    getBookmarks().then((bookmarkTree) => {
      console.log('북마크 트리 getB:', bookmarkTree)
      console.log('북마크 트리 getB:', bookmarkTree[0].children[0].children)
      setBookmarks(bookmarkTree[0].children[0].children)
    })
  }

  const uniqueArray = (arr) => {
    return [...new Set(arr)]
  }

  const fixBookMark = (bookmarkId) => {
    const fixedIdArr = []

    const fixedId = window.localStorage.getItem('fixedId')

    fixedIdArr.push(bookmarkId)
    console.log('bookmarkId', bookmarkId, 'fixedIdArr', fixedIdArr)

    const fixedIdArray = fixedId ? JSON.parse(fixedId) : []

    // 새 결과 배열 생성 및 저장
    const fixResultArr = [...fixedIdArr, ...fixedIdArray]
    const uniqueCheckResultArr = uniqueArray(fixResultArr)

    console.log('살펴보기 : ', uniqueCheckResultArr)
    window.localStorage.setItem('fixedCnt', String(uniqueCheckResultArr.length))
    window.localStorage.setItem('fixedId', JSON.stringify(uniqueCheckResultArr))

    uniqueCheckResultArr.map((id, index) => {
      updateBookMarks({ id: id }, index)
    })
    setUiActionBtn(true)
  }
  const [uiActionBtn, setUiActionBtn] = useState<boolean>(false)
  const clearBookMark = (bookmarkId) => {
    const fixedId = JSON.parse(window.localStorage.getItem('fixedId') || '[]') // const fixedIdArray = fixedId ? JSON.parse(fixedId) : []
    // const filterRemoveFixedIdArray = fixedId.find((item) => item === bookmarkId)
    const fixedCnt = window.localStorage.getItem('fixedCnt')
    const bookmarkIdCompare = fixedId.find((item) => item === bookmarkId) !== undefined
    const bookmarkIdRemoveFilter = fixedId.filter((item) => item !== bookmarkId)
    updateBookMarks({ id: bookmarkIdCompare }, Number(fixedCnt))
    window.localStorage.setItem('fixedCnt', String(bookmarkIdRemoveFilter.length))
    window.localStorage.setItem('fixedId', JSON.stringify(bookmarkIdRemoveFilter))
    setUiActionBtn(true)
  }

  // 컴포넌트 마운트 시 북마크 목록을 가져옵니다.

  const [storedBookIdStateArr, setStoredBookIdStateArr] = useState([])

  useEffect(() => {
    const bookMarkWord = window.localStorage.getItem('bookmarkkey')
    console.log('스토로지', bookMarkWord === '')
    bookMarkWord === '' && getBookMarksCode()
    bookMarkWord !== '' && searchBookmarks(bookMarkWord)
    const fixedId = JSON.parse(window.localStorage.getItem('fixedId') || '[]') // const fixedIdArray = fixedId ? JSON.parse(fixedId) : []
    setStoredBookIdStateArr(fixedId)
    setUiActionBtn(false)
  }, [uiActionBtn])

  console.log('배열 찾기', storedBookIdStateArr)

  return (
    <div className="book_mark_box">
      <div className="book_mark_title_box">
        <h1 className="book_mark_title">Bookmark Assistant</h1>
      </div>
      <div className="book_mark_search_box">
        <input type="text" id="searchText" />
        <button className="search-btn" onClick={() => setBookMarkSearchWord()}>
          search
        </button>
      </div>
      <div className="book_mark_box_inner">
        <ul className="book_mark_box_text_ul">
          {bookmarks.length === 0 ? (
            <p>No bookmarks found.</p>
          ) : (
            bookmarks.map((bookmark) => (
              <li key={bookmark.id} className="book_mark_box_text_li">
                <a
                  className="title_font"
                  href={bookmark.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {bookmark.title}
                </a>
                {storedBookIdStateArr.includes(bookmark.id) ? (
                  <button className="action_btn_clear" onClick={() => clearBookMark(bookmark.id)}>
                    clear
                  </button>
                ) : (
                  <button className="action_btn_fix" onClick={() => fixBookMark(bookmark.id)}>
                    fix
                  </button>
                )}
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  )
}

export default Main
