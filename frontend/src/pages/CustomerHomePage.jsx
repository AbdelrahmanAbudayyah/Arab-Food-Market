import { useAuth } from '../contexts/AuthContext';
import { useGuest } from '../contexts/GuestContext';

import { useEffect, useState } from 'react';
import axiosInstance from'../axiosInstance';
import { useNavigate } from 'react-router-dom';

import './css/customerHomePage.css';

export default function CustomerHomePage() {
  const { user } = useAuth();
  const {guest,tempLocation}=useGuest();
  const [chefs, setChefs] = useState([]);
  const [followingChefs,setFollowingChefs]= useState([]);
  const [searchInput, setSearchInput] = useState('');
  const [searchCategory, setSearchCategory] = useState('state');
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);



  const [currentImage, setCurrentImage] = useState(0);
  const images = [
    '/images/food.webp',
    '/images/food2.jpeg',
    '/images/food3.png',
    '/images/food4.png'
  ];
  // Change the image every 3 seconds
    useEffect(() => {
      const interval = setInterval(() => {
        setCurrentImage((prev) => (prev + 1) % images.length);
      }, 10000);
      return () => clearInterval(interval);
    }, []);

  // Load default chefs based on user location
  useEffect(() => {
    if (user) {
      console.log(user.city,user.state);
      fetchChefs({ city: user.city, state: user.state });
      getFollowing();
    }
    else if (guest && (tempLocation.city || tempLocation.state)) {
      fetchChefs({ city: tempLocation.city, state: tempLocation.state });
    }
  }, [user,guest, tempLocation]);

  const fetchChefs = async ({ city = '', state = '', name = '' }) => {
    try {
      setLoading(true);
      const params = {};
    if (city) params.city = city;
    if (state) params.state = state;
    if (name) params.name = name;
      const response = await axiosInstance.get('/users/chefs', {params},{
        withCredentials: true // so cookies get sent/stored
      });
      console.log('Fetched chefs:', response.data); 
      setChefs(response.data);
    } catch (error) {
      console.error('Error fetching chefs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchChefs({ [searchCategory]: searchInput });
  };
  const handleReset = () => {
    setSearchInput('');
    setSearchCategory('state');
    if (user) {
      fetchChefs({ city: user.city, state: user.state });
    } else if (guest){
      fetchChefs({ city: tempLocation.city, state: tempLocation.state });
    }
    else{
      fetchChefs({});
  }
  };

  const getFollowing=async () =>{

    try{
      setLoading(true);
    const res= await axiosInstance.get('/users/following',{withCredentials:true});
    console.log(res.data);
    setFollowingChefs(res.data);

    }catch (err) {
      if (err.response?.status === 401) {
        try {
          await axiosInstance.post('/refresh-token', {}, { withCredentials: true });
          const res= await axiosInstance.get('/users/following',{withCredentials:true});
           console.log(res.data);
           setFollowingChefs(res.data);

    } catch (refreshError) {
          console.error('Token refresh failed or retry failed:', refreshError);
        }
      } else {
        //setError("Failed to load conversations.");
        console.error('get following chefs error:', err);
      }
    }
    finally {
      setLoading(false);
    } 
  };
  

  return (
    <div className="home-container">
      {/* 1. Hero Section */}
      <div className="hero-section">
      <div className="slideshow-container">
        <div className="slideshow">
          {images.length > 0 && images.map((image, index) => (
            <img
              key={index}
              src={image}
              alt="Delicious Arab food"
              className={`slide-image ${index === currentImage ? 'active' : ''}`}
            />
          ))}
        </div>
      </div>
        <div className="hero-overlay">
        <div className="search-bar">
  <div className="search-left">
    <select
      value={searchCategory}
      onChange={(e) => setSearchCategory(e.target.value)}
      className="search-select"
    >
      <option value="name">Name</option>
      <option value="city">City</option>
      <option value="state">State</option>
    </select>

    <input
      type="text"
      placeholder={`Search by ${searchCategory}`}
      value={searchInput}
      onChange={(e) => setSearchInput(e.target.value)}
      className="search-input"
    />
  </div>

  <div className="search-right">
    <button onClick={handleSearch} className="search-button">
      Search
    </button>
    <button onClick={handleReset} className="reset-button">
      Reset
    </button>
  </div>
</div>
        </div>
      </div>

      {/* 3. Discover Chefs */}
      <section className="carousel-section">
        <h2>Discover Chefs</h2>
        {loading ? (
          <p>Loading chefs...</p>
        ) : chefs.length === 0 ? (
          <p>No chefs found.</p>
        ) : (
          <div className="chef-carousel">
            {chefs.map((chef) => (
              <div
                key={chef.id}
                className="chef-card"
                onClick={() => navigate(`/chef/${chef.id}/${chef.name}`)}
              >
                <img
                  src={
                    chef?.image_url
                      ? `http://localhost:1800${chef.image_url}`
                      : '/default-profile.png'
                  }
                  alt={chef.name}
                />
                <h3>{chef.name}</h3>
                <p>{chef.bio}</p>

                <p>{chef.city}, {chef.state}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 4. Following Chefs */}
      {user &&(
      <section className="carousel-section">
        <h2>Your Following</h2>
        {loading ? (
          <p>Loading chefs...</p>
        ) : followingChefs.length === 0 ? (
          <p>No chefs found.</p>
        ) : (
          <div className="chef-carousel">
            {followingChefs.map((chef) => (
              <div
                key={chef.id}
                className="chef-card"
                onClick={() => navigate(`/chef/${chef.id}`)}
              >
                <img
                  src={
                    chef?.image_url
                      ? `http://localhost:1800${chef.image_url}`
                      : '/default-profile.png'
                  }
                  alt={chef.name}
                />
                <h3>{chef.name}</h3>
                <p>{chef.bio}</p>
                <p>{chef.city}, {chef.state}</p>
              </div>
            ))}
          </div>
        )}
      </section>
       )}
    </div>
     
  );
}
