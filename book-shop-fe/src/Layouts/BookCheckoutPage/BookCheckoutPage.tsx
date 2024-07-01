import { useEffect, useState } from "react";
import BookModel from "../../Models/BookModel";
import { SpinnerLoading } from "../Utils/SpinnerLoading";
import { StarReview } from "../Utils/StarReview";
import { CheckoutAndReviewBox } from "./CheckoutAndReviewBox";
import ReviewModel from "../../Models/ReviewModel";
import { LatestReviews } from "./LatestReviews";

export const BookCheckoutPage = () => {
    const [book, setBook] = useState<BookModel>();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    //review state
    const [reviews, setReviews] = useState<ReviewModel[]>([]);
    const [totalStars, setTotalStars] = useState(0);
    const [isLoading, setIsLoading] = useState(true);


    const bookId = (window.location.pathname).split('/')[2];

    useEffect(() => {
        const fetchBooks = async () => {
            const baseUrl = `http://localhost:8080/api/books/${bookId}`;
            const response = await fetch(baseUrl);
            if (!response.ok) {
                throw new Error("Something went wrong!");
            }
            const responseJson = await response.json();

            const loadBooks: BookModel = {
                id: responseJson.id,
                title: responseJson.title,
                author: responseJson.author,
                description: responseJson.description,
                copies: responseJson.copies,
                copiesAvailable: responseJson.copiesAvailable,
                category: responseJson.category,
                img: responseJson.img
            };


            setBook(loadBooks);
            setIsLoading(false);
        };
        fetchBooks().catch((error: any) => {
            setIsLoading(false);
            setError(error.message);
        })
    }, []);

    useEffect(() => {
        const fetchReview = async () => {
            const baseUrl = `http://localhost:8080/api/reviews/search/findByBookId?bookId=${bookId}`;
            const response = await fetch(baseUrl);
            if (!response.ok) {
                throw new Error("Something went wrong!");
            }
            const responseJson = await response.json();

            const responseData = await responseJson._embedded.reviews;

            let starWeigh: number = 0;

            const loadReviews: ReviewModel[] = [];
            for (const item in responseData) {
                loadReviews.push({
                    id: responseData[item].id,
                    userEmail: responseData[item].userEmail,
                    date: responseData[item].date,
                    rating: responseData[item].rating,
                    book_id: responseData[item].bookId,
                    reviewDescription: responseData[item].reviewDescription
                })
                starWeigh += responseData[item].rating;
            }

            if (isLoading) {
                const round = (Math.round((starWeigh / loadReviews.length) * 2) / 2).toFixed(1);
                setTotalStars(Number(round));
            }

            setReviews(loadReviews);
            setLoading(false);
        }
        fetchReview().catch((error: any) => {
            setIsLoading(false);
            setError(error.message);
        })
    })


    if (loading || isLoading) {
        return (
            <SpinnerLoading />
        );
    }

    if (error) {
        return (
            <div className="container m-5">
                <p>{error}</p>
            </div>
        );
    }
    return (
        <div>
            <div className="container d-none d-lg-block">
                <div className="row mt-5">
                    <div className="col-sm-2 col-md-2">
                        {book?.img ?
                            <img src={book.img} width="226" height="349" alt="Book" />
                            :
                            <img src={require('../../Images/BooksImages/book-luv2code-1000.png')} width="226" height="349" alt="Book" />
                        }
                    </div>
                    <div className="col-4 col-md-4 container">
                        <div className="ml-2">
                            <h2>{book?.title}</h2>
                            <h5 className="text-primary">{book?.author}</h5>
                            <p className="lead">{book?.description}</p>
                            <StarReview rating={totalStars} size={32} />
                        </div>
                    </div>
                    <CheckoutAndReviewBox book={book} mobile={false} />
                    <hr />
                    <LatestReviews review={reviews} bookId={book?.id} mobile={false} />
                </div>

            </div>
            <div className="container d-lg-none mt-5">
                <div className="d-flex justify-content-center align-items-center">
                    {book?.img ?
                        <img src={book.img} width="226" height="349" alt="Book" />
                        :
                        <img src={require('../../Images/BooksImages/book-luv2code-1000.png')} width="226" height="349" alt="Book" />
                    }
                </div>
                <div className="mt-4">
                    <div className="ml-2">
                        <h2>{book?.title}</h2>
                        <h5 className="text-primary">{book?.author}</h5>
                        <p className="lead">{book?.description}</p>
                        <StarReview rating={totalStars} size={32} />
                    </div>
                </div>
                <CheckoutAndReviewBox book={book} mobile={true} />
                <hr />
                <LatestReviews review={reviews} bookId={book?.id} mobile={true} />
            </div>

        </div>
    );
}