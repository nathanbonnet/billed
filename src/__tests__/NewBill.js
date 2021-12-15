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
    test("when a new bill is created", () => {
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }

      window.localStorage.setItem('user', JSON.stringify({
        email: 'toto@toto.fr'
      }))

      const html = NewBillUI();
      document.body.innerHTML = html;

      const newBill = new NewBill({ 
        document, onNavigate, firestore: null, localStorage: window.localStorage
      })
      
      const handleSubmit = jest.fn(newBill.handleSubmit);
      const formNewBill = document.querySelector(`form[data-testid="form-new-bill"]`)
      formNewBill.addEventListener('submit', handleSubmit);
      fireEvent.submit(formNewBill)
      expect(handleSubmit).toHaveBeenCalled()
      // expect(screen.getAllByText('Mes notes de frais')).toBeTruthy()       
    })
    test.skip("when an image is added to the form", async (done) => {
      const snapshot = {
        ref: {
          getDownloadURL: () => 'https://url.test'
        }
      }

      class Storage {
        ref() { return this }
        async put() { return snapshot }
      }

      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      const html = '<form data-testid="form-new-bill"><input required type="file" class="form-control blue-border" data-testid="file" /></form>'
      document.body.innerHTML = html;

      const file = new File(['file'], 'file.png', { type: 'image/png' })
      const fileGif = new File(['file'], 'file.gif', { type: 'image/gif'})

      const newBill = new NewBill({ 
        document, onNavigate, firestore: {storage: new Storage()}, localStorage: window.localStorage
      })

      const fileInput = document.querySelector(`input[data-testid="file"]`)
      fileInput.addEventListener('change', handleChangeFile)
      userEvent.upload(fileInput, file)
      expect(handleChangeFile).toHaveBeenCalled()
      expect(fileInput.files[0].name).toBe(file.name)

      // fileInput.addEventListener('change', handleChangeFile)
      // userEvent.upload(fileInput, fileGif)
      // expect(handleChangeFile).toThrowError("extension non autorisé (jpg, jpeg, png)")
    })
  })
})


// test d'intégration GET
// describe("Given I am a user connected as employée", () => {
//   describe("When I create a new bill", () => {
//     test("fetches bills from mock API GET", async () => {
//        const getSpy = jest.spyOn(firebase, "get")
//        const bills = await firebase.get()
//        console.log(bills.data)
//        expect(getSpy).toHaveBeenCalledTimes(1)
//        expect(bills.data.length).toBe(4)
//     })
//     test("fetches bills from an API and fails with 404 message error", async () => {
//       firebase.get.mockImplementationOnce(() =>
//         Promise.reject(new Error("Erreur 404"))
//       )
//       const html = DashboardUI({ error: "Erreur 404" })
//       document.body.innerHTML = html
//       const message = await screen.getByText(/Erreur 404/)
//       expect(message).toBeTruthy()
//     })
//     test("fetches messages from an API and fails with 500 message error", async () => {
//       firebase.get.mockImplementationOnce(() =>
//         Promise.reject(new Error("Erreur 500"))
//       )
//       const html = DashboardUI({ error: "Erreur 500" })
//       document.body.innerHTML = html
//       const message = await screen.getByText(/Erreur 500/)
//       expect(message).toBeTruthy()
//     })
//   })
// })