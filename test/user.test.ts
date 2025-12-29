import { describe, expect, test, beforeAll, mock } from 'bun:test'
import { createTestApp, createTestToken } from './setup'
import { UserService, WishService } from '../src/modules/user/service'

describe('User API', () => {
  let app: Elysia
  let validToken: string

  beforeAll(async () => {
    app = createTestApp()
    validToken = await createTestToken(app, 1)
  })

  // ===== 내 정보 관리 테스트 =====
  
  describe('My Profile Management', () => {
    describe('GET /api/v1/users/me', () => {
      test('should return my profile with valid token', async () => {
        mock.module('../src/modules/user/service', () => ({
          UserService: {
            getUserProfile: mock(async (userId: number) => ({
              id: userId,
              socialType: 'google',
              nickname: 'Test User',
              profileImageUrl: 'https://example.com/image.jpg',
              wishCnt: 5,
              noteCnt: 3,
              createdAt: new Date('2024-01-01')
            }))
          }
        }))

        const response = await app.handle(
          new Request('http://localhost/api/v1/users/me', {
            headers: {
              'Cookie': `accessToken=${validToken}`
            }
          })
        )

        expect(response.status).toBe(200)
        const body = await response.json()
        expect(body.nickname).toBe('Test User')
        expect(body.wishCnt).toBe(5)
        expect(body.noteCnt).toBe(3)
      })

      test('should return 401 without token', async () => {
        const response = await app.handle(
          new Request('http://localhost/api/v1/users/me')
        )

        expect(response.status).toBe(401)
      })

      test('should return 401 with invalid token', async () => {
        const response = await app.handle(
          new Request('http://localhost/api/v1/users/me', {
            headers: {
              'Cookie': 'accessToken=invalid-token'
            }
          })
        )

        expect(response.status).toBe(401)
      })
    })

    describe('POST /api/v1/users/me', () => {
      test('should update my profile with valid data', async () => {
        mock.module('../src/modules/user/service', () => ({
          UserService: {
            updateUserProfile: mock(async (userId: number, data: any) => ({
              id: userId,
              socialType: 'google',
              nickname: data.nickname || 'Updated User',
              profileImageUrl: data.profileImageUrl || 'https://example.com/new.jpg',
              wishCnt: 5,
              noteCnt: 3,
              createdAt: new Date()
            }))
          }
        }))

        const response = await app.handle(
          new Request('http://localhost/api/v1/users/me', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Cookie': `accessToken=${validToken}`
            },
            body: JSON.stringify({
              nickname: 'Updated User',
              profileImageUrl: 'https://example.com/new.jpg'
            })
          })
        )

        expect(response.status).toBe(200)
        const body = await response.json()
        expect(body.nickname).toBe('Updated User')
      })
    })
  })

  // ===== 내 위시리스트 테스트 =====
  
  describe('My Wish Management', () => {
    describe('GET /api/v1/users/me/wishes', () => {
      test('should return my wish list', async () => {
        mock.module('../src/modules/user/service', () => ({
          UserService: {
            getUserWishList: mock(async (userId: number, query: any) => ({
              items: [
                {
                  id: 1,
                  name: '와인1',
                  image: 'wine1.jpg',
                  category: 'Wine',
                  wish: 100,
                  rating: 4.5,
                  viewCnt: 500,
                  noteCnt: 10,
                  isWish: true
                }
              ],
              pageUtil: {
                page: 1,
                size: 10,
                total: 1,
                totalPages: 1
              }
            }))
          }
        }))

        const response = await app.handle(
          new Request('http://localhost/api/v1/users/me/wishes?page=1&size=10', {
            headers: {
              'Cookie': `accessToken=${validToken}`
            }
          })
        )

        expect(response.status).toBe(200)
        const body = await response.json()
        expect(body.items).toHaveLength(1)
        expect(body.items[0].name).toBe('와인1')
      })
    })

    describe('GET /api/v1/users/me/wishes/:alcoholId', () => {
      test('should check if specific alcohol is wished', async () => {
        mock.module('../src/modules/user/service', () => ({
          WishService: {
            isWished: mock(async () => true)
          }
        }))

        const response = await app.handle(
          new Request('http://localhost/api/v1/users/me/wishes/123', {
            headers: {
              'Cookie': `accessToken=${validToken}`
            }
          })
        )

        expect(response.status).toBe(200)
        const body = await response.json()
        expect(body.isWished).toBe(true)
      })

      test('should return false if not wished', async () => {
        mock.module('../src/modules/user/service', () => ({
          WishService: {
            isWished: mock(async () => false)
          }
        }))

        const response = await app.handle(
          new Request('http://localhost/api/v1/users/me/wishes/456', {
            headers: {
              'Cookie': `accessToken=${validToken}`
            }
          })
        )

        expect(response.status).toBe(200)
        const body = await response.json()
        expect(body.isWished).toBe(false)
      })
    })

    describe('POST /api/v1/users/me/wishes/:alcoholId', () => {
      test('should add alcohol to wish list', async () => {
        mock.module('../src/modules/user/service', () => ({
          WishService: {
            addWish: mock(async () => {})
          }
        }))

        const response = await app.handle(
          new Request('http://localhost/api/v1/users/me/wishes/123', {
            method: 'POST',
            headers: {
              'Cookie': `accessToken=${validToken}`
            }
          })
        )

        expect(response.status).toBe(200)
        const body = await response.json()
        expect(body.success).toBe(true)
      })

      test('should return error if already wished', async () => {
        mock.module('../src/modules/user/service', () => ({
          WishService: {
            addWish: mock(async () => {
              throw new Error('Already wished')
            })
          }
        }))

        const response = await app.handle(
          new Request('http://localhost/api/v1/users/me/wishes/123', {
            method: 'POST',
            headers: {
              'Cookie': `accessToken=${validToken}`
            }
          })
        )

        expect(response.status).toBe(500)
      })
    })

    describe('DELETE /api/v1/users/me/wishes/:alcoholId', () => {
      test('should remove alcohol from wish list', async () => {
        mock.module('../src/modules/user/service', () => ({
          WishService: {
            removeWish: mock(async () => {})
          }
        }))

        const response = await app.handle(
          new Request('http://localhost/api/v1/users/me/wishes/123', {
            method: 'DELETE',
            headers: {
              'Cookie': `accessToken=${validToken}`
            }
          })
        )

        expect(response.status).toBe(204)
      })

      test('should return error if wish not found', async () => {
        mock.module('../src/modules/user/service', () => ({
          WishService: {
            removeWish: mock(async () => {
              throw new Error('Wish not found')
            })
          }
        }))

        const response = await app.handle(
          new Request('http://localhost/api/v1/users/me/wishes/123', {
            method: 'DELETE',
            headers: {
              'Cookie': `accessToken=${validToken}`
            }
          })
        )

        expect(response.status).toBe(500)
      })
    })
  })

  // ===== 내 노트 테스트 =====
  
  describe('My Notes', () => {
    describe('GET /api/v1/users/me/notes', () => {
      test('should return my notes', async () => {
        mock.module('../src/modules/user/service', () => ({
          UserService: {
            getUserNotes: mock(async (userId: number, query: any) => ({
              items: [
                {
                  id: 1,
                  alcoholId: 1,
                  alcoholName: '와인1',
                  alcoholImage: 'wine1.jpg',
                  content: '좋은 와인입니다',
                  rating: 4.5,
                  createdAt: new Date('2024-01-01')
                }
              ],
              pageUtil: {
                page: 1,
                size: 10,
                total: 1,
                totalPages: 1
              }
            }))
          }
        }))

        const response = await app.handle(
          new Request('http://localhost/api/v1/users/me/notes?page=1&size=10', {
            headers: {
              'Cookie': `accessToken=${validToken}`
            }
          })
        )

        expect(response.status).toBe(200)
        const body = await response.json()
        expect(body.items).toHaveLength(1)
        expect(body.items[0].content).toBe('좋은 와인입니다')
      })

      test('should return empty list when no notes', async () => {
        mock.module('../src/modules/user/service', () => ({
          UserService: {
            getUserNotes: mock(async () => ({
              items: [],
              pageUtil: {
                page: 1,
                size: 10,
                total: 0,
                totalPages: 0
              }
            }))
          }
        }))

        const response = await app.handle(
          new Request('http://localhost/api/v1/users/me/notes', {
            headers: {
              'Cookie': `accessToken=${validToken}`
            }
          })
        )

        expect(response.status).toBe(200)
        const body = await response.json()
        expect(body.items).toHaveLength(0)
      })
    })
  })

  // ===== 내 게시물 테스트 =====
  
  describe('My Posts', () => {
    describe('GET /api/v1/users/me/posts', () => {
      test('should return my posts', async () => {
        mock.module('../src/modules/user/service', () => ({
          UserService: {
            getUserPosts: mock(async (userId: number, query: any) => ({
              items: [
                {
                  id: 1,
                  title: '와인 추천',
                  content: '오늘의 와인 추천입니다',
                  viewCnt: 100,
                  likeCnt: 10,
                  commentCnt: 5,
                  createdAt: new Date('2024-01-01')
                }
              ],
              pageUtil: {
                page: 1,
                size: 10,
                total: 1,
                totalPages: 1
              }
            }))
          }
        }))

        const response = await app.handle(
          new Request('http://localhost/api/v1/users/me/posts?page=1&size=10', {
            headers: {
              'Cookie': `accessToken=${validToken}`
            }
          })
        )

        expect(response.status).toBe(200)
        const body = await response.json()
        expect(body.items).toHaveLength(1)
        expect(body.items[0].title).toBe('와인 추천')
      })
    })
  })

  // ===== 특정 사용자 정보 테스트 (인증 필요) =====
  
  describe('Public User APIs (Requires Auth)', () => {
    describe('GET /api/v1/users/:userId', () => {
      test('should return public profile with valid token', async () => {
        mock.module('../src/modules/user/service', () => ({
          UserService: {
            getPublicProfile: mock(async (userId: number) => ({
              id: userId,
              nickname: 'Public User',
              profileImageUrl: 'https://example.com/public.jpg',
              wishCnt: 10,
              noteCnt: 5,
              createdAt: new Date('2024-01-01')
            }))
          }
        }))

        const response = await app.handle(
          new Request('http://localhost/api/v1/users/123', {
            headers: {
              'Cookie': `accessToken=${validToken}`
            }
          })
        )

        expect(response.status).toBe(200)
        const body = await response.json()
        expect(body.nickname).toBe('Public User')
        expect(body.socialType).toBeUndefined()
      })

      test('should return 401 without token', async () => {
        const response = await app.handle(
          new Request('http://localhost/api/v1/users/123')
        )

        expect(response.status).toBe(401)
      })
    })

    describe('GET /api/v1/users/:userId/wishes', () => {
      test('should return wish list with valid token', async () => {
        mock.module('../src/modules/user/service', () => ({
          UserService: {
            getPublicWishList: mock(async (userId: number, query: any) => ({
              items: [
                {
                  id: 2,
                  name: '위스키',
                  image: 'whiskey.jpg',
                  category: 'Whiskey',
                  wish: 50,
                  rating: 4.8,
                  viewCnt: 300,
                  noteCnt: 5,
                  isWish: false
                }
              ],
              pageUtil: {
                page: 1,
                size: 10,
                total: 1,
                totalPages: 1
              }
            }))
          }
        }))

        const response = await app.handle(
          new Request('http://localhost/api/v1/users/123/wishes', {
            headers: {
              'Cookie': `accessToken=${validToken}`
            }
          })
        )

        expect(response.status).toBe(200)
        const body = await response.json()
        expect(body.items).toHaveLength(1)
        expect(body.items[0].name).toBe('위스키')
      })

      test('should return 401 without token', async () => {
        const response = await app.handle(
          new Request('http://localhost/api/v1/users/123/wishes')
        )

        expect(response.status).toBe(401)
      })
    })
  })

  // ===== 인증 관련 테스트 =====
  
  describe('Authentication', () => {
    test('all endpoints should return 401 without token', async () => {
      const endpoints = [
        '/api/v1/users/me',
        '/api/v1/users/me/wishes',
        '/api/v1/users/me/wishes/123',
        '/api/v1/users/me/notes',
        '/api/v1/users/me/posts',
        '/api/v1/users/123',  // 공개 API도 인증 필요
        '/api/v1/users/123/wishes'  // 공개 API도 인증 필요
      ]

      for (const endpoint of endpoints) {
        const response = await app.handle(
          new Request(`http://localhost${endpoint}`)
        )
        expect(response.status).toBe(401)
      }
    })
  })
})