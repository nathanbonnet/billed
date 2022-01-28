import { screen } from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import Bills from "../containers/Bills.js"
import { bills } from "../fixtures/bills.js"
import LoadingPage from "../views/LoadingPage"
import errorPage from "../views/ErrorPage"
import { ROUTES } from "../constants/routes"
import userEvent from '@testing-library/user-event'
import firebase from "../__mocks__/firebase"
import { ROUTES_PATH } from '../constants/routes.js'
import { localStorageMock } from '../__mocks__/localStorage';

const onNavigate = (pathname) => {
  document.body.innerHTML = ROUTES({ pathname })
}

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {

    beforeEach(() => {
      document.body.innerHTML = BillsUI({ data: bills })
    })
    
    test("check that if no bill is created the page is displayed", () => {
      const html = BillsUI({ data: []})
      expect(html).toBeTruthy();
    })
    test("Then bills should be ordered from earliest to latest", () => {
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })
    test("checks if the loading page is displayed", () => {
      const html = BillsUI({ data: bills, loading: true, error: false })
      expect(html).toEqual(LoadingPage());
    })
    test("checks if the error page is displayed", () => {
      const html = BillsUI({ data: bills, loading: false, error: true })
      expect(html).toEqual(errorPage("true"));
    })

    test("when the form is submit, we are redirected to the pages: note de frais", () => {
      
      const bill = new Bills({ 
        document, onNavigate, firestore: null, localStorage
      })

      const buttonNewBill = document.querySelector(`button[data-testid="btn-new-bill"]`)
      expect(buttonNewBill).toBeTruthy()

      bill.handleClickNewBill();
      const title = document.querySelector('.content-title')
      expect(title.innerHTML).toEqual(' Envoyer une note de frais ')
    })

    describe("When I click on the icon eye of a bill", () => {
      test("the modal is open", () => {
        let show = "";
        $.fn.modal = jest.fn(modalValue => {
          show = modalValue
        });

        const bills = new Bills({
          document, firestore: null, localStorage: window.localStorage
        })

        const handleClickIconEye = jest.fn(bills.handleClickIconEye)
        const eye = screen.getAllByTestId('icon-eye')[0]
        eye.addEventListener('click', handleClickIconEye(eye))
        userEvent.click(eye)

        expect(handleClickIconEye).toHaveBeenCalled()
        expect(show).toEqual("show");
      })
    })
  })
})

// // test d'intégration GET
// describe("When I navigate to Bills", () => {
//   const getRequest = jest
//     .fn(firebase.get)
//     .mockImplementationOnce(firebase.get)
//     .mockImplementationOnce(() => Promise.reject(new Error('Erreur 404')))
//     .mockImplementationOnce(() => Promise.reject(new Error('Erreur 500')))

//   test("fetches bills from mock API GET", async () => {
//     const bills = await getRequest()
//     const { data } = bills

//     expect(getRequest).toHaveBeenCalledTimes(1)
//     expect(data.length).toBe(4)
//   })

//   test("fetches bills from an API and fails with 404 message error", async () => {
//     let response

//     try {
//       response = await getRequest()
//     } catch (e) {
//       response = {error: e}
//     }

//     document.body.innerHTML = BillsUI(response)

//     expect(getRequest).toHaveBeenCalledTimes(2)
//     expect(screen.getByText(/Erreur 404/)).toBeTruthy()
//   })

//   test("fetches bills from an API and fails with 500 message error", async () => {
//     let response

//     try {
//       response = await getRequest()
//     } catch (e) {
//       response = {error: e}
//     }

//     document.body.innerHTML = BillsUI(response)

//     expect(getRequest).toHaveBeenCalledTimes(3)
//     expect(screen.getByText(/Erreur 500/)).toBeTruthy()
//   })
// })

// test d'intégration GET
describe("Given I am a user connected as Admin", () => {
  describe("When I navigate to Bills", () => {
    test("fetches bills from mock API GET", async () => {
       const getSpy = jest.spyOn(firebase, "get")
       const bills = await firebase.get()
       expect(getSpy).toHaveBeenCalledTimes(1)
       expect(bills.data.length).toBe(4)
    })
    test("fetches bills from an API and fails with 404 message error", async () => {
      firebase.get.mockImplementationOnce(() =>
        Promise.reject(new Error("Erreur 404"))
      )
      const html = BillsUI({ error: "Erreur 404" })
      document.body.innerHTML = html
      const message = await screen.getByText(/Erreur 404/)
      expect(message).toBeTruthy()
    })
    test("fetches messages from an API and fails with 500 message error", async () => {
      firebase.get.mockImplementationOnce(() =>
        Promise.reject(new Error("Erreur 500"))
      )
      const html = BillsUI({ error: "Erreur 500" })
      document.body.innerHTML = html
      const message = await screen.getByText(/Erreur 500/)
      expect(message).toBeTruthy()
    })
  })
})

