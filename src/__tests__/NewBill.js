import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import userEvent from '@testing-library/user-event'
import { fireEvent, screen } from "@testing-library/dom"
import { localStorageMock } from '../__mocks__/localStorage';
import firebase from '../__mocks__/firebase';
import { ROUTES } from '../constants/routes';
import BillsUI from '../views/BillsUI';

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    describe('uploade new file', () => {

      const snapshot = {
        ref: {
          getDownloadURL: () => 'https://url.test'
        }
      }

      class Storage {
        ref() { return this }
        async put() { return snapshot }
      }
      
      const html = NewBillUI();
      document.body.innerHTML = html;

      jest.spyOn(window, 'alert').mockImplementation(() => {});

      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({pathname})
      }

      const newBill = new NewBill({ 
        document, onNavigate, firestore: {storage: new Storage()}, localStorage: window.localStorage 
      })

      const fileInput = document.querySelector(`input[data-testid="file"]`)
      const handleChangeFile = jest.fn(newBill.handleChangeFile);
      fileInput.addEventListener('change', handleChangeFile);
    	
    	test('When I choose a file in a correct format to upload, the file should be loaded and handled', () => {
        	const fileTrue = new File(['testFile'], 'testFile.jpg', {type: 'image/jpg'})

          userEvent.upload(fileInput, fileTrue);
          expect(handleChangeFile).toHaveBeenCalled();
          expect(fileInput.files[0]).toStrictEqual(fileTrue);
          expect(fileInput.files).toHaveLength(1);
          expect(fileInput.files[0].name).toEqual('testFile.jpg')
          expect(window.alert).not.toHaveBeenCalled();
    	})

    	test('When I choose a new file in an incorrect format, there should be an alert', () => {

        	const fileFalse = new File(['testFile'], 'testFile.txt', {type: 'text/txt'})

          userEvent.upload(fileInput, fileFalse);
          expect(handleChangeFile).toHaveBeenCalled();
          expect(fileInput.files[0]).toStrictEqual(fileFalse);
          expect(fileInput.files).toHaveLength(1);
          expect(window.alert).toHaveBeenCalled();
        })
  	})
    describe('when a new bill is created', () => {
      test("if the form is correct", () => {
  
        window.localStorage.setItem('user', JSON.stringify({
          email: 'toto@toto.fr'
        }))
  
        const html = NewBillUI();
        document.body.innerHTML = html;
        const onNavigate = jest.fn();
        const newBill = new NewBill({
          document, onNavigate, firestore: null, localStorage: window.localStorage
        })
  
        const handleSubmit = jest.fn(newBill.handleSubmit);
        const formNewBill = document.querySelector(`form[data-testid="form-new-bill"]`)
        formNewBill.addEventListener('submit', handleSubmit);
        fireEvent.submit(formNewBill)
        expect(handleSubmit).toHaveBeenCalled()
      })
    })
  })
})

// test d'intégration GET
describe("Given I am a user connected as Admin", () => {
  describe("When I navigate to Bills", () => {
    test("fetches bills from mock API GET", async () => {
       const getSpy = jest.spyOn(firebase, "post")
       const bills = await firebase.post()
       expect(getSpy).toHaveBeenCalledTimes(1)
       expect(bills.data.length).toBe(1)
    })
    test("fetches bills from an API and fails with 404 message error", async () => {
      firebase.post.mockImplementationOnce(() =>
        Promise.reject(new Error("Erreur 404"))
      )
      const html = BillsUI({ error: "Erreur 404" })
      document.body.innerHTML = html
      const message = await screen.getByText(/Erreur 404/)
      expect(message).toBeTruthy()
    })
    test("fetches messages from an API and fails with 500 message error", async () => {
      firebase.post.mockImplementationOnce(() =>
        Promise.reject(new Error("Erreur 500"))
      )
      const html = BillsUI({ error: "Erreur 500" })
      document.body.innerHTML = html
      const message = await screen.getByText(/Erreur 500/)
      expect(message).toBeTruthy()
    })
  })
})
