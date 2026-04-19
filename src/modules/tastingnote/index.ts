import { Elysia } from 'elysia'
import { t } from 'elysia'
import { authGuard } from '../auth/middleware'

import { TastingNote } from './service'
import { TastingNoteModel } from './model'

export const tastingnote = new Elysia({
  prefix: '/notes'
})
  .get('/', async ({ query }) => {
    return await TastingNote.getNotes(query)
  }, {
    query: TastingNoteModel.SearchParams,
    detail: {
      summary: 'Get tasting note list',
      tags: ['TastingNote']
    },
    response: {
      200: TastingNoteModel.TastingNoteListResponse
    }
  })
  .get('/hot', async () => {
    return await TastingNote.getHotNotes()
  }, {
    detail: {
      summary: 'Get hot tasting notes',
      tags: ['TastingNote']
    },
    response: {
      200: TastingNoteModel.HotTastingNoteListResponse
    }
  })
  .get('/best/:alcoholId', async ({ params: { alcoholId } }) => {
    return await TastingNote.getBestNotes(alcoholId)
  }, {
    params: t.Object({
      alcoholId: t.Numeric()
    }),
    detail: {
      summary: 'Get best tasting notes by alcohol ID',
      tags: ['TastingNote']
    },
    response: {
      200: TastingNoteModel.BestTastingNoteListResponse
    }
  })
  .get('/:noteId', async ({ params: { noteId }, set }) => {
    const note = await TastingNote.getNoteById(noteId)

    if (!note) {
      set.status = 404
      return { error: '존재하지 않는 테이스팅 노트입니다.' }
    }

    return note
  }, {
    params: t.Object({
      noteId: t.Numeric()
    }),
    detail: {
      summary: 'Get tasting note by ID',
      tags: ['TastingNote']
    },
    response: {
      200: TastingNoteModel.TastingNoteResponse,
      404: t.Object({
        error: t.String()
      })
    }
  })
  .use(authGuard)
  .put('/:noteId', async ({ params: { noteId }, body, set, authUser }) => {
    const result = await TastingNote.updateNote(noteId, authUser.userId, body)

    if (!result.success) {
      if (result.status === 404) {
        set.status = 404
        return { error: result.error as string }
      }
      if (result.status === 403) {
        set.status = 403
        return { error: result.error as string }
      }
    }

    return result
  }, {
    params: t.Object({
      noteId: t.Numeric()
    }),
    body: TastingNoteModel.UpdateTastingNoteRequest,
    detail: {
      summary: 'Update tasting note',
      tags: ['TastingNote']
    }
  })
  .delete('/:noteId', async ({ params: { noteId }, set, authUser }) => {
    const result = await TastingNote.deleteNote(noteId, authUser.userId)

    if (!result.success) {
      if (result.status === 404) {
        set.status = 404
        return { error: result.error as string }
      }
      if (result.status === 403) {
        set.status = 403
        return { error: result.error as string }
      }
    }

    return result
  }, {
    params: t.Object({
      noteId: t.Numeric()
    }),
    detail: {
      summary: 'Delete tasting note',
      tags: ['TastingNote']
    }
  })
  .post('/:noteId/comments', async ({ params: { noteId }, body, set, authUser }) => {
    const result = await TastingNote.createComment(noteId, authUser.userId, body)

    if (!result.success) {
      if (result.status === 404) {
        set.status = 404
        return { error: result.error as string }
      }
    }

    set.status = 201
    return result
  }, {
    params: t.Object({
      noteId: t.Numeric()
    }),
    body: TastingNoteModel.CreateCommentRequest,
    detail: {
      summary: 'Create comment',
      tags: ['TastingNote']
    }
  })
  .put('/:noteId/comments/:commentId', async ({ params: { noteId, commentId }, body, set, authUser }) => {
    const result = await TastingNote.updateComment(noteId, commentId, authUser.userId, body)

    if (!result.success) {
      if (result.status === 404) {
        set.status = 404
        return { error: result.error as string }
      }
      if (result.status === 403) {
        set.status = 403
        return { error: result.error as string }
      }
      if (result.status === 400) {
        set.status = 400
        return { error: result.error as string }
      }
    }

    return result
  }, {
    params: t.Object({
      noteId: t.Numeric(),
      commentId: t.Numeric()
    }),
    body: TastingNoteModel.UpdateCommentRequest,
    detail: {
      summary: 'Update comment',
      tags: ['TastingNote']
    }
  })
  .delete('/:noteId/comments/:commentId', async ({ params: { noteId, commentId }, set, authUser }) => {
    const result = await TastingNote.deleteComment(noteId, commentId, authUser.userId)

    if (!result.success) {
      if (result.status === 404) {
        set.status = 404
        return { error: result.error as string }
      }
      if (result.status === 403) {
        set.status = 403
        return { error: result.error as string }
      }
      if (result.status === 400) {
        set.status = 400
        return { error: result.error as string }
      }
    }

    return result
  }, {
    params: t.Object({
      noteId: t.Numeric(),
      commentId: t.Numeric()
    }),
    detail: {
      summary: 'Delete comment',
      tags: ['TastingNote']
    }
  })
  .post('/', async ({ body, set, authUser }) => {
    const result = await TastingNote.createNote(authUser.userId, body)

    if (!result.success) {
      set.status = result.status ?? 400
      return { error: result.error as string }
    }

    set.status = 201
    return result
  }, {
    body: TastingNoteModel.CreateTastingNoteRequest,
    detail: {
      summary: 'Create tasting note',
      tags: ['TastingNote']
    }
  })

