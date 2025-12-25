import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAppContext } from '../context/AppContext';
import { assets } from '../assets/assets';

const InputField = ({ type, placeholder, name, handleChange, address }) => (
  <input
    className='w-full px-2 py-2.5 border border-gray-500/30 rounded outline-none text-gray-500 focus:border-primary transition'
    type={type}
    placeholder={placeholder}
    onChange={handleChange}
    name={name}
    value={address[name]}
    required
  />
);

const AddAddress = () => {
  const { axios, user, cartItems, products, setCartItems } = useAppContext();
  const navigate = useNavigate();
  const location = useLocation();

  const [address, setAddress] = useState({
    firstName: '',
    lastName: '',
    email: '',
    street: '',
    city: '',
    state: '',
    zipcode: '',
    country: '',
    phone: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAddress((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post('/api/address/add', { address });

      if (data.success) {
        toast.success('Address added successfully');

        if (location.state?.placeOrderNow) {
          const res = await axios.get('/api/address/get');
          const latestAddress = res.data?.addresses?.[0];

          const cartArray = Object.keys(cartItems).map((key) => {
            const product = products.find((p) => p._id === key);
            return product ? { product: product._id, quantity: cartItems[key] } : null;
          }).filter(Boolean);

          const orderPayload = {
            userId: user._id,
            items: cartArray,
            address: latestAddress._id
          };

          const orderRes = await axios.post('/api/order/cod', orderPayload);
          if (orderRes.data.success) {
            toast.success('Order placed successfully');
            setCartItems({});
            navigate('/my-orders');
          } else {
            toast.error(orderRes.data.message || 'Order failed');
            navigate('/cart');
          }
        } else {
          navigate('/cart');
        }
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  // ✅ FIX: Wait until user is loaded
  useEffect(() => {
    if (user === null) return; // wait until user is resolved
    if (!user) {
      navigate('/cart');
    }
  }, [user]);

  return (
    <div className='mt-16 pb-16'>
      <p className='text-2xl md:text-3xl text-gray-500'>
        Add Shipping <span className='font-semibold text-primary'>Address</span>
      </p>
      <div className='flex flex-col-reverse md:flex-row justify-between mt-10'>
        <div className='flex-1 max-w-md'>
          <form onSubmit={onSubmitHandler} className='space-y-3 mt-6 text-sm'>
            <div className='grid grid-cols-2 gap-4'>
              <InputField handleChange={handleChange} address={address} name='firstName' type='text' placeholder='First Name' />
              <InputField handleChange={handleChange} address={address} name='lastName' type='text' placeholder='Last Name' />
            </div>

            <InputField handleChange={handleChange} address={address} name='email' type='email' placeholder='Email address' />
            <InputField handleChange={handleChange} address={address} name='street' type='text' placeholder='Street' />

            <div className='grid grid-cols-2 gap-4'>
              <InputField handleChange={handleChange} address={address} name='city' type='text' placeholder='City' />
              <InputField handleChange={handleChange} address={address} name='state' type='text' placeholder='State' />
            </div>

            <div className='grid grid-cols-2 gap-4'>
              <InputField handleChange={handleChange} address={address} name='zipcode' type='number' placeholder='Zip code' />
              <InputField handleChange={handleChange} address={address} name='country' type='text' placeholder='Country' />
            </div>

            <InputField handleChange={handleChange} address={address} name='phone' type='text' placeholder='Phone' />

            <button className='w-full mt-6 bg-primary text-white py-3 hover:bg-primary-dull transition cursor-pointer uppercase'>
              Save address
            </button>
          </form>
          </div>
            <img className='md:mr-16 mb-16 md:mt-0' src={assets.add_address_iamge} alt="Add Address" />
      </div>
    </div>
  );
};

export default AddAddress;
