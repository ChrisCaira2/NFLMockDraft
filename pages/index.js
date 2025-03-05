import Link from 'next/link';

export default function Home() {
    return (
        <div className="container">
            <h1>NFL Mock Draft Tool</h1>
            <Link href="/draft-setup" passHref>
                <div className="button">Start Mock Draft</div>
            </Link>
            <style jsx>{`
                .container {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    min-height: 100vh;
                    background-color: #1a1a1a;
                    color: #fff;
                    font-family: Arial, sans-serif;
                    padding: 0 20px;
                }
                .button {
                    margin-top: 20px;
                    padding: 10px 20px;
                    background-color: #007bff;
                    color: #fff;
                    border: none;
                    border-radius: 5px;
                    cursor: pointer;
                    transition: background-color 0.3s;
                }
                .button:hover {
                    background-color: #0056b3;
                }
            `}</style>
        </div>
    );
}
