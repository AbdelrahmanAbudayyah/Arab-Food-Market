import { render, screen,waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Header from '../components/Header/Header';
import { useAuth } from '../contexts/AuthContext';
import axiosInstance from '../axiosInstance';


jest.mock('../contexts/AuthContext', ()=>({
useAuth:jest.fn(),
}));

// Mock axiosInstance
jest.mock('../axiosInstance', () => ({
    post: jest.fn()
     }));

describe('Header',()=>{

    const loginMock =jest.fn();

    beforeEach(()=>{
        useAuth.mockReturnValue({login:loginMock});
    })
  
    afterEach(() => {
        jest.clearAllMocks();
      });

  describe('login modal',()=>{

    test('renders sign in side nav bar', async()=>{
        const user = userEvent.setup();
        render(<Header/>);

        await user.click(screen.getByRole('button'));
        expect(screen.getByText('Sign In')).toBeInTheDocument();
    });

    test('render sign in popup modal when clicked',async ()=>{
        const user = userEvent.setup();

        const mockUser = {id:12,name:"aboodd",email:"abood@hotmail.com",state:"WA",city:"Kent",type:"chef",image_url:"/uploads/1745621952400-qatayef.jpeg",bio:"im a chef",followers_count:2} ;
        axiosInstance.post.mockResolvedValueOnce({ data: { user: mockUser } });

        render(<Header/>);
        await user.click(screen.getByRole('button'));
        await user.click(screen.getByText('Sign In'));

        await user.type(screen.getByPlaceholderText('Email'),'abood@hotmail.com');
        await user.type(screen.getByPlaceholderText('Password'),'abood123');
        await user.click(screen.getByRole('button', { name: 'Sign In' }));

        await waitFor(() => {
            expect(loginMock).toHaveBeenCalledWith(mockUser);
            expect(axiosInstance.post).toHaveBeenCalledWith(
              '/users/login',
              {
                email: 'abood@hotmail.com',
                password: 'abood123'
              },
              { withCredentials: true }
            );
          });




    });

  }); 


  describe('sign up modal',()=>{

    test('renders sign up side nav bar', async()=>{
        const user = userEvent.setup();
        render(<Header/>);

        await user.click(screen.getByRole('button'));
        expect(screen.getByText('Sign Up')).toBeInTheDocument();
    });

    test('render sign up popup modal when clicked',async ()=>{
        const user = userEvent.setup();

        const mockUser = {id:12,name:"aboodd",email:"abood@hotmail.com",state:"WA",city:"Kent",type:"customer",image_url:"/uploads/1745621952400-qatayef.jpeg",followers_count:0} ;
        axiosInstance.post.mockResolvedValueOnce({ data: { user: mockUser } });

        render(<Header/>);
        await user.click(screen.getByRole('button'));
        await user.click(screen.getByText('Sign Up'));

        await user.type(screen.getByPlaceholderText('Email'),'abood@hotmail.com');
        await user.type(screen.getByPlaceholderText('Password'),'abood123');
        await user.type(screen.getByPlaceholderText('Name'),'abood');
        await user.type(screen.getByPlaceholderText('State'),'WA');
        await user.type(screen.getByPlaceholderText('City'),'renton');



        await user.click(screen.getByRole('button', { name: 'Sign Up' }));

        await waitFor(() => {
            
            expect(axiosInstance.post).toHaveBeenCalledWith(
              '/users/signup',
              expect.any(FormData),
              { withCredentials: true }
            );
            expect(loginMock).toHaveBeenCalledWith(mockUser);
          });




    });

  }); 






});
