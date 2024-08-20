import { Link } from "react-router-dom";

const BlogHead = () => {
  return (
    <div>
      <div className="hero-large-screen">
        <div className="bg-white flex flex-cols px-24 py-6  items-center justify-between">
          <Link to="/" className=" text-3xl font-bold">
            OMEC
          </Link>
          <div className="flex flex-cols gap-16 text-xl font-medium">
            <div>
              <Link to="/createBlog">Create</Link>
            </div>
            <div>
              <Link to="/blogList">Blog List</Link>
            </div>
          </div>
        </div>
      </div>
      <div className="hero-small-screen">
        <div className="bg-white flex flex-cols px-6 py-4  items-center justify-between">
          <div className=" text-3xl font-bold">OMEC</div>
          {/* <div className="flex flex-cols gap-16 text-xl font-medium">
            <div>
              <Link to="/">Home</Link>
            </div>
            <div>
              <Link to="services">Services & Facilities</Link>
            </div>
            <div>
              <Link to="/">Blog</Link>
            </div>
          </div>
          <div className="bg-[#FFA500] text-lg rounded-full px-5 py-3 text-white font-medium ">
            <Link to="/contact">Contact Us</Link>
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default BlogHead;
