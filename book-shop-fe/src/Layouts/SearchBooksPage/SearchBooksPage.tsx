import { useEffect, useState } from "react";
import BookModel from "../../Models/BookModel";
import { SpinnerLoading } from "../Utils/SpinnerLoading";
import { SearchBook } from "./components/SearchBook";
import { Pagination } from "../Utils/Pagination";
export const SearchBooksPage = () => {

    const [books, setBooks] = useState<BookModel[]>([]);
    const [loading, setLoading] = useState(true);
    const [httpError, setHttpError] = useState(null);
    //pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [booksPerPage] = useState(5);
    const [totalAmountOfBooks, setTotalAmountOfBooks] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    //search
    const [search, setSearch] = useState(' ');
    const [searchUrl, setSearchUrl] = useState('');
    //category
    const [category, setCategory] = useState('Book Category');

    useEffect(() => {
        const fetchBooks = async () => {
            const baseUrl = "http://localhost:8080/api/books";

            let url: string = '';

            if (search === '') {
                url = `${baseUrl}?page=${currentPage - 1}&size=${booksPerPage}`;
            } else {
                url = baseUrl + searchUrl;
            }
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error("Something went wrong!");
            }
            const responseJson = await response.json();
            const responseData = await responseJson._embedded.books;

            //set pagination
            setTotalAmountOfBooks(responseJson.page.totalElements);
            setTotalPages(responseJson.page.totalPages);


            const loadBooks: BookModel[] = [];

            for (const key in responseData) {
                loadBooks.push({
                    id: responseData[key].id,
                    title: responseData[key].title,
                    author: responseData[key].author,
                    description: responseData[key].description,
                    copies: responseData[key].copies,
                    copiesAvailable: responseData[key].copiesAvailable,
                    category: responseData[key].category,
                    img: responseData[key].img
                });
            }

            setBooks(loadBooks);
            setLoading(false);
        };
        fetchBooks().catch((error: any) => {
            setLoading(false);
            setHttpError(error.message);
        })
        window.scrollTo(0, 0)
    }, [currentPage, searchUrl]);

    if (loading) {
        return (
            <SpinnerLoading />
        );
    }

    if (httpError) {
        return (
            <div className="container m-5">
                <p>{httpError}</p>
            </div>
        );
    }

    const searchHandleChanges = () => {
        setCurrentPage(1);
        if (search === '') {
            setSearchUrl(' ');
        } else {
            setSearchUrl(`/search/findByTitleContaining?title=${search}&page=0&size=${booksPerPage}`);
        }
    }
    const categoryField = (value: string) => {
        if (
            value.toLowerCase() === 'fe' ||
            value.toLowerCase() === 'be' ||
            value.toLowerCase() === 'data' ||
            value.toLowerCase() === 'devops'
        ) {
            setCategory(value);
            setSearchUrl(`/search/findByCategory?category=${value}&page=0&size=${booksPerPage}`)
        } else {
            setCategory('All');
            setSearchUrl(`?page=0&size=${booksPerPage}`)
        }
    }
    const indexOfLastBook: number = currentPage * booksPerPage;
    const indexOfFirstBook: number = indexOfLastBook - booksPerPage;
    let lastItem = booksPerPage * currentPage <= totalAmountOfBooks ?
        booksPerPage * currentPage : totalAmountOfBooks;

    const paginate = (pageNumber: number) => setCurrentPage(pageNumber);
    return (
        <div>
            <div className="container">
                <div>
                    <div className="row mt-5">
                        <div className="col-6">
                            <div className="d-flex">
                                <input className="form-control me-2" type="search" placeholder="Search"
                                    aria-labelledby="Search" onChange={e => setSearch(e.target.value)} />
                                <button className="btn btn-outline-success"
                                    onClick={() => searchHandleChanges()}>
                                    Search
                                </button>
                            </div>
                        </div>
                        <div className="col-4">
                            <div className="dropdown">
                                <button className="btn btn-secondary dropdown-toggle" type="button"
                                    id="dropdownMenuButton1" data-bs-toggle="dropdown" aria-expanded="false"  >
                                    {category}
                                </button>
                                <ul className="dropdown-menu" aria-labelledby="dropdownMenuButton1" >
                                    <li onClick={() => categoryField('All')}>
                                        <a className="dropdown-item" href="#" >All</a>
                                    </li>
                                    <li onClick={() => categoryField('FE')}>
                                        <a className="dropdown-item" href="#" >Front End</a>
                                    </li>
                                    <li onClick={() => categoryField('DevOps')}>
                                        <a className="dropdown-item" href="#" >DevOps</a>
                                    </li>
                                    <li onClick={() => categoryField('BE')}>
                                        <a className="dropdown-item" href="#" >Back End</a>
                                    </li>
                                    <li onClick={() => categoryField('Data')}>
                                        <a className="dropdown-item" href="#" >Data</a>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    {totalAmountOfBooks > 0 ?
                        <>
                            <div className="mt-3">
                                <h5>Number of results: ({totalAmountOfBooks})</h5>
                            </div>
                            <p>
                                {indexOfFirstBook + 1} to {lastItem} of {totalAmountOfBooks} items:
                            </p>
                            {books.map(book => (
                                <SearchBook book={book} key={book.id} />
                            ))}
                        </>
                        :
                        <div className="m-5">
                            <h3>
                                Can't find what you are looking for?
                            </h3>
                            <a type="button" className="btn main-color btn-md px-4 me-md-2 fw-bold text-white" href="#">
                                Library Services
                            </a>
                        </div>
                    }
                </div>
                {
                    totalPages > 1 &&
                    <Pagination currentPage={currentPage} totalPage={totalPages} paginate={paginate} />
                }
            </div>
        </div>
    );

}