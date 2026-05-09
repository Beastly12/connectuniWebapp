describe('Landing page', () => {
  beforeEach(() => {
    cy.clearLocalStorage()
    cy.visit('/')
  })

  it('shows the hero content and primary calls to action', () => {
    cy.findByRole('heading', {
      level: 1,
      name: /where students\s*meet the alumni\s*who came before/i,
    }).should('be.visible')

    cy.findByText(/connectuni bridges the gap/i).should('be.visible')
    cy.findByRole('link', { name: /^join connectuni$/i }).should('have.attr', 'href', '/signup')
    cy.findByRole('link', { name: /see how it works/i }).should('have.attr', 'href', '#features')
  })

  it('navigates to key landing sections from the main nav', () => {
    cy.findByRole('navigation', { name: /main navigation/i }).within(() => {
      cy.findByRole('link', { name: /features/i }).click()
    })

    cy.location('hash').should('eq', '#features')
    cy.findByRole('heading', { name: /built for every\s*university role/i }).should('be.visible')

    cy.findByRole('navigation', { name: /main navigation/i }).within(() => {
      cy.findByRole('link', { name: /community/i }).click()
    })

    cy.location('hash').should('eq', '#community')
    cy.findByRole('heading', { name: /what our community says/i }).should('be.visible')
  })

  it('opens and closes the mobile navigation drawer', () => {
    cy.viewport('iphone-x')
    cy.findByRole('button', { name: /open navigation menu/i }).click()

    cy.findByRole('dialog', { name: /navigation menu/i }).should('be.visible')
    cy.findByRole('button', { name: /close navigation menu/i }).click()
    cy.findByRole('dialog', { name: /navigation menu/i }).should('not.exist')
  })
})
