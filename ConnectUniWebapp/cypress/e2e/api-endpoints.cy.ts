type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE'

interface ApiResponse<T = unknown> {
  status: number
  body: T
}

interface AuthTokens {
  access_token: string
  refresh_token: string
}

const apiUrl = (Cypress.env('API_URL') as string | undefined) ?? 'https://cuni-api.ddns.net'
const email = Cypress.env('E2E_EMAIL') as string | undefined
const password = Cypress.env('E2E_PASSWORD') as string | undefined
const e2eEmailDomain = (Cypress.env('E2E_EMAIL_DOMAIN') as string | undefined) ?? 'example.com'
const runWrites = Cypress.env('E2E_RUN_WRITES') === true || Cypress.env('E2E_RUN_WRITES') === 'true'
const avatarFixture = Cypress.env('E2E_AVATAR_FIXTURE') as string | undefined

const envNumber = (name: string): number | undefined => {
  const value = Cypress.env(name)
  if (value == null || value === '') return undefined
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : undefined
}

function request<T = unknown>(
  method: HttpMethod,
  path: string,
  token?: string,
  options: Partial<Cypress.RequestOptions> = {},
) {
  return cy.request<T>({
    method,
    url: `${apiUrl}${path}`,
    failOnStatusCode: false,
    headers: token ? { Authorization: `Bearer ${token}`, ...options.headers } : options.headers,
    ...options,
  })
}

function expectOkOrKnownEmpty(response: ApiResponse, allowed = [200, 204, 404]) {
  expect(response.status).to.be.oneOf(allowed)
}

function expectArrayResponse(response: ApiResponse) {
  expect(response.status).to.eq(200)
  expect(response.body).to.be.an('array')
}

describe('API endpoints used by the app', () => {
  let accessToken = ''
  let refreshToken = ''
  let currentUserId: number | undefined
  let communityId = envNumber('E2E_COMMUNITY_ID')
  let postId = envNumber('E2E_POST_ID')
  let messageId = envNumber('E2E_MESSAGE_ID')
  let eventId = envNumber('E2E_EVENT_ID')
  let mentorId = envNumber('E2E_MENTOR_ID')
  let requestId = envNumber('E2E_MENTORSHIP_REQUEST_ID')
  let relationshipId = envNumber('E2E_RELATIONSHIP_ID')
  let jobId = envNumber('E2E_JOB_ID')
  let notificationId = envNumber('E2E_NOTIFICATION_ID')

  before(function () {
    if (!email || !password) {
      cy.log('Skipping authenticated API coverage. Set CYPRESS_E2E_EMAIL and CYPRESS_E2E_PASSWORD to enable it.')
      this.skip()
    }

    cy.request<AuthTokens>({
      method: 'POST',
      url: `${apiUrl}/auth/login`,
      failOnStatusCode: false,
      form: true,
      body: {
        username: email,
        password,
      },
    }).then((response) => {
      expect(response.status).to.eq(200)
      expect(response.body).to.have.property('access_token').and.be.a('string')
      expect(response.body).to.have.property('refresh_token').and.be.a('string')
      accessToken = response.body.access_token
      refreshToken = response.body.refresh_token
    })
  })

  describe('auth and profile endpoints', () => {
    it('POST /auth/login returns tokens for the test user', () => {
      expect(accessToken).to.be.a('string').and.not.be.empty
      expect(refreshToken).to.be.a('string').and.not.be.empty
    })

    it('POST /auth/refresh refreshes the test session', () => {
      request<AuthTokens>('POST', `/auth/refresh?refresh_token=${encodeURIComponent(refreshToken)}`).then((response) => {
        expect(response.status).to.eq(200)
        expect(response.body).to.have.property('access_token').and.be.a('string')
        expect(response.body).to.have.property('refresh_token').and.be.a('string')
        accessToken = response.body.access_token
        refreshToken = response.body.refresh_token
      })
    })

    it('GET /profile/me returns the current full profile', () => {
      request<Record<string, unknown>>('GET', '/profile/me', accessToken).then((response) => {
        expect(response.status).to.eq(200)
        expect(response.body).to.have.property('id')
        if (typeof response.body.id === 'number') currentUserId = response.body.id
      })
    })

    it('GET /profiles/me/completion returns profile completion data', () => {
      request('GET', '/profiles/me/completion', accessToken).then((response) => {
        expect(response.status).to.eq(200)
        expect(response.body).to.have.property('percentage')
      })
    })

    it('GET /auth/verify-email handles an invalid token without a server error', () => {
      request('GET', '/auth/verify-email?token=cypress-invalid-token').then((response) => {
        expect(response.status).to.be.oneOf([400, 401, 404, 422])
      })
    })

    it('POST /auth/forgot-password is covered with the test user email', () => {
      request('POST', '/auth/forgot-password', undefined, {
        body: { email },
      }).then((response) => {
        expect(response.status).to.be.oneOf([200, 202, 400, 404, 422])
      })
    })

    it('POST /auth/resend-verification is covered with the test user email', () => {
      request('POST', '/auth/resend-verification', undefined, {
        body: { email },
      }).then((response) => {
        expect(response.status).to.be.oneOf([200, 202, 400, 404, 409, 422])
      })
    })
  })

  describe('mentorship endpoints', () => {
    it('GET /mentorship/mentors returns mentor listings', () => {
      request<unknown[]>('GET', '/mentorship/mentors?skills=career&goals=mentorship&university=test', accessToken)
        .then((response) => {
          expectArrayResponse(response)
          const firstMentor = response.body.find((mentor) => {
            return typeof mentor === 'object' && mentor !== null && 'id' in mentor
          }) as { id?: number } | undefined
          mentorId ??= firstMentor?.id
        })
    })

    it('GET /mentorship/mentor-profile/me returns profile or not-found', () => {
      request('GET', '/mentorship/mentor-profile/me', accessToken).then((response) => {
        expectOkOrKnownEmpty(response)
      })
    })

    it('GET /mentorship/requests/outgoing returns outgoing requests', () => {
      request<unknown[]>('GET', '/mentorship/requests/outgoing', accessToken).then((response) => {
        expectArrayResponse(response)
        requestId ??= (response.body[0] as { id?: number } | undefined)?.id
      })
    })

    it('GET /mentorship/requests/incoming returns incoming requests', () => {
      request<unknown[]>('GET', '/mentorship/requests/incoming', accessToken).then((response) => {
        expectArrayResponse(response)
        requestId ??= (response.body[0] as { id?: number } | undefined)?.id
      })
    })

    it('GET /mentorship/relationships/my-mentees returns mentee relationships', () => {
      request<unknown[]>('GET', '/mentorship/relationships/my-mentees', accessToken).then((response) => {
        expectArrayResponse(response)
        relationshipId ??= (response.body[0] as { id?: number } | undefined)?.id
      })
    })

    it('GET /mentorship/relationships/my-mentors returns mentor relationships', () => {
      request<unknown[]>('GET', '/mentorship/relationships/my-mentors', accessToken).then((response) => {
        expectArrayResponse(response)
        relationshipId ??= (response.body[0] as { id?: number } | undefined)?.id
      })
    })

    it('GET /mentorship/relationships/:id/sessions is covered when a relationship id is available', function () {
      if (!relationshipId) this.skip()

      request('GET', `/mentorship/relationships/${relationshipId}/sessions`, accessToken).then((response) => {
        expectArrayResponse(response)
      })
    })
  })

  describe('community and post endpoints', () => {
    it('GET /communities returns available communities', () => {
      request<unknown[]>('GET', '/communities', accessToken).then((response) => {
        expectArrayResponse(response)
        communityId ??= (response.body[0] as { id?: number } | undefined)?.id
      })
    })

    it('GET /communities/me returns current user communities', () => {
      request<unknown[]>('GET', '/communities/me', accessToken).then((response) => {
        expectArrayResponse(response)
        communityId ??= (response.body[0] as { id?: number } | undefined)?.id
      })
    })

    it('GET /communities/:id returns a community when an id is available', function () {
      if (!communityId) this.skip()

      request('GET', `/communities/${communityId}`, accessToken).then((response) => {
        expect(response.status).to.eq(200)
      })
    })

    it('GET /communities/:id/messages returns community messages when an id is available', function () {
      if (!communityId) this.skip()

      request<unknown[]>('GET', `/communities/${communityId}/messages?page=1&limit=50`, accessToken).then((response) => {
        expectArrayResponse(response)
        messageId ??= (response.body[0] as { id?: number } | undefined)?.id
      })
    })

    it('GET /posts/:id/comments is covered when a post id is available', function () {
      if (!postId) this.skip()

      request('GET', `/posts/${postId}/comments`, accessToken).then((response) => {
        expectArrayResponse(response)
      })
    })
  })

  describe('events and notification endpoints', () => {
    it('GET /events/ returns upcoming events', () => {
      request<unknown[]>('GET', '/events/', accessToken).then((response) => {
        expectArrayResponse(response)
        eventId ??= (response.body[0] as { id?: number } | undefined)?.id
      })
    })

    it('GET /events/past returns past events', () => {
      request('GET', '/events/past', accessToken).then((response) => {
        expectArrayResponse(response)
      })
    })

    it('GET /events/rsvps returns current user RSVPs', () => {
      request('GET', '/events/rsvps', accessToken).then((response) => {
        expectArrayResponse(response)
      })
    })

    it('GET /notifications returns notifications', () => {
      request<unknown[]>('GET', '/notifications', accessToken).then((response) => {
        expectArrayResponse(response)
        notificationId ??= (response.body[0] as { id?: number } | undefined)?.id
      })
    })

    it('GET /notifications/unread-count returns unread count', () => {
      request('GET', '/notifications/unread-count', accessToken).then((response) => {
        expect(response.status).to.eq(200)
        expect(response.body).to.have.property('unread_count')
      })
    })
  })

  describe('write endpoints used by the app', () => {
    beforeEach(function () {
      if (!runWrites) {
        cy.log('Skipping write endpoint coverage. Set CYPRESS_E2E_RUN_WRITES=true to enable mutating API tests.')
        this.skip()
      }
    })

    it('PATCH /profiles/me updates editable profile fields', () => {
      request('PATCH', '/profiles/me', accessToken, {
        body: {
          headline: 'Cypress E2E test profile',
          bio: 'Updated by Cypress endpoint coverage.',
          goals: 'Endpoint coverage',
          skills: ['testing'],
          interests: ['automation'],
        },
      }).then((response) => {
        expectOkOrKnownEmpty(response, [200, 204])
      })
    })

    it('POST /profile/mentorship/preferences saves mentorship preferences', () => {
      request('POST', '/profile/mentorship/preferences', accessToken, {
        body: {
          is_mentor: false,
          is_mentee: true,
          areas_of_interest: ['Career advice'],
          availability_hours_per_week: 1,
          preferred_format: 'online',
        },
      }).then((response) => {
        expect(response.status).to.be.oneOf([200, 201])
      })
    })

    it('POST /auth/register covers registration using a unique disposable test account', () => {
      const uniqueEmail = `cypress-${Date.now()}@${e2eEmailDomain}`

      request('POST', '/auth/register', undefined, {
        body: {
          email: uniqueEmail,
          password: 'CypressTest123!',
          full_name: 'Cypress E2E User',
          university_name: 'Cypress University',
          graduation_year: new Date().getFullYear() + 2,
          major: 'Testing',
          role: 'STUDENT',
        },
      }).then((response) => {
        expect(response.status).to.be.oneOf([200, 201, 202, 400, 409, 422])
      })
    })

    it('POST /profile/student covers student profile writes', () => {
      request('POST', '/profile/student', accessToken, {
        body: {
          university_name: 'Cypress University',
          course_title: 'Automated Testing',
          year_of_study: 2,
          expected_graduation: new Date().getFullYear() + 2,
        },
      }).then((response) => {
        expect(response.status).to.be.oneOf([200, 201, 400, 403, 409, 422])
      })
    })

    it('POST /profile/alumni covers alumni profile writes', () => {
      request('POST', '/profile/alumni', accessToken, {
        form: true,
        body: {
          university_name: 'Cypress University',
          course_completed: 'Automated Testing',
          graduation_year: String(new Date().getFullYear() - 1),
        },
      }).then((response) => {
        expect(response.status).to.be.oneOf([200, 201, 400, 403, 409, 422])
      })
    })

    it('POST /profile/professional covers professional profile writes', () => {
      request('POST', '/profile/professional', accessToken, {
        body: {
          job_title: 'QA Engineer',
          company: 'Cypress',
          industry_sector: 'Software',
          years_of_experience: 3,
          linkedin_url: 'https://www.linkedin.com/in/cypress-test',
        },
      }).then((response) => {
        expect(response.status).to.be.oneOf([200, 201, 400, 403, 409, 422])
      })
    })

    it('PUT /profiles/me/avatar is covered when an avatar fixture is configured', function () {
      if (!avatarFixture) this.skip()

      cy.fixture(avatarFixture, 'binary')
        .then((binary) => Cypress.Blob.binaryStringToBlob(binary, 'image/png'))
        .then((blob) => {
          const formData = new FormData()
          formData.append('file', blob, 'avatar.png')

          return request('PUT', '/profiles/me/avatar', accessToken, {
            body: formData,
            headers: {},
          })
        })
        .then((response) => {
          expect(response.status).to.be.oneOf([200, 201, 204, 400, 422])
        })
    })

    it('POST and PATCH /mentorship/mentor-profile/me cover mentor profile writes', () => {
      request('POST', '/mentorship/become-mentor', accessToken, {
        body: {
          bio: 'Cypress mentor profile',
          linkedin_url: 'https://www.linkedin.com/in/cypress-test',
          expertise_areas: ['Testing'],
          mentorship_goals: ['Career advice'],
          max_mentees: 1,
        },
      }).then((createResponse) => {
        expect(createResponse.status).to.be.oneOf([200, 201, 409])

        request('PATCH', '/mentorship/mentor-profile/me', accessToken, {
          body: {
            bio: 'Cypress mentor profile updated',
            expertise_areas: ['Testing', 'Automation'],
            mentorship_goals: ['Career advice'],
            max_mentees: 1,
          },
        }).then((patchResponse) => {
          expectOkOrKnownEmpty(patchResponse, [200, 204, 404])
        })
      })
    })

    it('POST and DELETE /communities/:id join/leave are covered when a community id is available', function () {
      if (!communityId) this.skip()

      request('POST', `/communities/${communityId}/join`, accessToken).then((joinResponse) => {
        expect(joinResponse.status).to.be.oneOf([200, 201, 204, 409])

        request('DELETE', `/communities/${communityId}/leave`, accessToken).then((leaveResponse) => {
          expect(leaveResponse.status).to.be.oneOf([200, 204, 404])
        })
      })
    })

    it('POST /communities/:id/messages is covered when a community id is available', function () {
      if (!communityId) this.skip()

      request('POST', `/communities/${communityId}/messages`, accessToken, {
        form: true,
        body: {
          content: `Cypress endpoint coverage ${Date.now()}`,
        },
      }).then((response) => {
        expect(response.status).to.be.oneOf([200, 201])
        messageId ??= (response.body as { id?: number }).id
      })
    })

    it('POST /communities/:id/messages/:messageId/reactions is covered when ids are available', function () {
      if (!communityId || !messageId) this.skip()

      request('POST', `/communities/${communityId}/messages/${messageId}/reactions`, accessToken, {
        body: { emoji: '👍' },
      }).then((response) => {
        expect(response.status).to.be.oneOf([200, 201])
      })
    })

    it('POST /events/ creates an event', () => {
      request('POST', '/events/', accessToken, {
        form: true,
        body: {
          title: `Cypress event ${Date.now()}`,
          description: 'Created by Cypress endpoint coverage.',
          location: 'Online',
          event_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          event_type: 'Networking',
          max_attendees: '10',
        },
      }).then((response) => {
        expect(response.status).to.be.oneOf([200, 201])
        eventId ??= (response.body as { id?: number }).id
      })
    })

    it('POST and DELETE /events/:id/rsvp are covered when an event id is available', function () {
      if (!eventId) this.skip()

      request('POST', `/events/${eventId}/rsvp`, accessToken).then((rsvpResponse) => {
        expect(rsvpResponse.status).to.be.oneOf([200, 201, 204, 409])

        request('DELETE', `/events/${eventId}/rsvp`, accessToken).then((cancelResponse) => {
          expect(cancelResponse.status).to.be.oneOf([200, 204, 404])
        })
      })
    })

    it('PATCH /notifications/:id/read is covered when a notification id is available', function () {
      if (!notificationId) this.skip()

      request('PATCH', `/notifications/${notificationId}/read`, accessToken).then((response) => {
        expectOkOrKnownEmpty(response, [200, 204, 404])
      })
    })

    it('PATCH /notifications/read-all marks all notifications read', () => {
      request('PATCH', '/notifications/read-all', accessToken).then((response) => {
        expectOkOrKnownEmpty(response, [200, 204])
      })
    })

    it('POST /mentorship/requests is covered when a mentor id is available', function () {
      if (!mentorId) this.skip()

      request('POST', '/mentorship/requests', accessToken, {
        body: {
          mentor_id: mentorId,
          goal: 'Cypress endpoint coverage',
          meeting_frequency: 'monthly',
          session_length_minutes: 30,
          message: 'Cypress endpoint coverage request.',
        },
      }).then((response) => {
        expect(response.status).to.be.oneOf([200, 201, 400, 409])
        requestId ??= (response.body as { id?: number }).id
      })
    })

    it('DELETE /mentorship/requests/:id is covered when a pending request id is available', function () {
      if (!requestId) this.skip()

      request('DELETE', `/mentorship/requests/${requestId}`, accessToken).then((response) => {
        expectOkOrKnownEmpty(response, [200, 204, 400, 404])
      })
    })

    it('POST /mentorship/relationships/:id/sessions is covered when a relationship id is available', function () {
      if (!relationshipId) this.skip()

      request('POST', `/mentorship/relationships/${relationshipId}/sessions`, accessToken, {
        body: {
          scheduled_at: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
          notes: 'Cypress endpoint coverage session.',
        },
      }).then((response) => {
        expect(response.status).to.be.oneOf([200, 201, 400, 404])
      })
    })

    it('PATCH /mentorship/relationships/:id/end is covered when a relationship id is available', function () {
      if (!relationshipId) this.skip()

      request('PATCH', `/mentorship/relationships/${relationshipId}/end`, accessToken).then((response) => {
        expectOkOrKnownEmpty(response, [200, 204, 400, 404])
      })
    })

    it('POST /jobs is covered when the backend jobs router is enabled', () => {
      request('POST', '/jobs', accessToken, {
        body: {
          title: `Cypress role ${Date.now()}`,
          company: 'Cypress',
          job_type: 'full-time',
          description: 'Created by Cypress endpoint coverage.',
          location: 'Remote',
          apply_url: 'https://example.com/apply',
        },
      }).then((response) => {
        expect(response.status).to.be.oneOf([200, 201, 404, 405])
        jobId ??= (response.body as { id?: number }).id
      })
    })

    it('POST /jobs/:id/apply is covered when a job id is available', function () {
      if (!jobId) this.skip()

      request('POST', `/jobs/${jobId}/apply`, accessToken, {
        body: { cover_letter: 'Cypress endpoint coverage application.' },
      }).then((response) => {
        expect(response.status).to.be.oneOf([200, 201, 400, 404, 409])
      })
    })

    it('POST /auth/logout logs out the test session', () => {
      request('POST', `/auth/logout?refresh_token=${encodeURIComponent(refreshToken)}`, accessToken).then((response) => {
        expectOkOrKnownEmpty(response, [200, 204])
      })
    })
  })
})
