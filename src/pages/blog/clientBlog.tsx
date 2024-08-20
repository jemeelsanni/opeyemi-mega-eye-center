import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "../../layout/header";
import Navbar from "../../layout/navbar";
import Footer from "../../layout/footer";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  query,
  orderBy,
  limit,
} from "firebase/firestore";
import { db } from "../../../firebase";

const ClientBlog: React.FC = () => {
  const [blogs, setBlogs] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const blogsPerPage = 5;
  const [latestBlogs, setLatestBlogs] = useState<any[]>([]);

  useEffect(() => {
    const fetchBlogs = async () => {
      const q = query(collection(db, "blogs"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const blogsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setBlogs(blogsData);

      // Fetch the five latest blogs for the "Writing" section
      const latestQuery = query(
        collection(db, "blogs"),
        orderBy("createdAt", "desc"),
        limit(5)
      );
      const latestSnapshot = await getDocs(latestQuery);
      const latestBlogsData = latestSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setLatestBlogs(latestBlogsData);
    };
    fetchBlogs();
  }, []);

  const handleDelete = async (id: string) => {
    await deleteDoc(doc(db, "blogs", id));
    setBlogs(blogs.filter((blog) => blog.id !== id));
  };

  const indexOfLastBlog = currentPage * blogsPerPage;
  const indexOfFirstBlog = indexOfLastBlog - blogsPerPage;
  const currentBlogs = blogs.slice(indexOfFirstBlog, indexOfLastBlog);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  return (
    <div>
      <Header />
      <Navbar />
      <div className="hero-large-screen">
        <div className="w-full flex gap-14 px-24 mb-32 mt-16">
          <div className="w-7/12">
            <ul>
              {currentBlogs.map((blog) => (
                <li key={blog.id}>
                  <Link to={`/blogDetail/${blog.id}`}>
                    <div>
                      <h5 className="text-4xl text-black mb-2 head capitalize">
                        {blog.title}
                      </h5>
                    </div>
                    <div className="flex justify-between mb-2 body">
                      <p className=" text-[#ffa500]">
                        {new Date(
                          blog.createdAt.seconds * 1000
                        ).toLocaleDateString()}
                      </p>
                      <p className=" text-[#ffa500]">{blog.readDuration}</p>
                    </div>
                    <div className="body text-black">{blog.description}</div>
                  </Link>
                  <br />
                </li>
              ))}
            </ul>
            <nav>
              <ul className="flex gap-3 text-center justify-center text-lg font-medium text-[#FFA500]">
                {Array.from(
                  { length: Math.ceil(blogs.length / blogsPerPage) },
                  (_, i) => (
                    <li key={i}>
                      <button onClick={() => paginate(i + 1)}>{i + 1}</button>
                    </li>
                  )
                )}{" "}
                ...
              </ul>
            </nav>
          </div>
          <div className="w-5/12">
            <div className="bg-[#ffa500] opacity-[50%] px-8 py-10 mb-4">
              <div className="mb-2">
                <h5 className="text-xl font-bold head mb-3">
                  Sign up for our newsletter
                </h5>
                <p className="body">
                  Subscribe to get the best insights in crypto delivered
                  directly to your inbox.
                </p>
              </div>
            </div>
            <div className="bg-[#ffa500] opacity-[50%] px-8 py-10">
              <div className="mb-2">
                <div className="border-b-2 border-black">
                  <h5 className="text-2xl heading my-1">Writing</h5>
                </div>
              </div>
              <div className="mt-2 body">
                {latestBlogs.map((blog) => (
                  <div
                    key={blog.id}
                    className="mb-6 bg-[#ffa500] text-black hover:text-lg font-medium "
                  >
                    <Link className="text-black" to={`/blogDetail/${blog.id}`}>
                      <div>{blog.title}</div>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="hero-small-screen pr-6">
        <ul>
          {currentBlogs.map((blog) => (
            <li key={blog.id}>
              <Link to={`/blogDetail/${blog.id}`}>
                <div>
                  <h5 className="text-4xl text-black mb-2 head capitalize">
                    {blog.title}
                  </h5>
                </div>
                <div className="flex justify-between mb-2 body">
                  <p className=" text-[#ffa500]">
                    {new Date(
                      blog.createdAt.seconds * 1000
                    ).toLocaleDateString()}
                  </p>
                  <p className=" text-[#ffa500]">{blog.readDuration}</p>
                </div>
                <div className="body text-black">{blog.description}</div>
              </Link>
              <br />
            </li>
          ))}
        </ul>
        <nav>
          <ul className="flex gap-3 text-center justify-center text-lg font-medium text-[#FFA500]">
            {Array.from(
              { length: Math.ceil(blogs.length / blogsPerPage) },
              (_, i) => (
                <li key={i}>
                  <button onClick={() => paginate(i + 1)}>{i + 1}</button>
                </li>
              )
            )}{" "}
            ...
          </ul>
        </nav>
      </div>
      <Footer />
    </div>
  );
};

export default ClientBlog;
