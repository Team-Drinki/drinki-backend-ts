import { Elysia } from 'elysia'
import { t } from 'elysia'

import { TastingNote } from './service'
import { TastingNoteModel } from './model'

export const tastingnote = new Elysia({
  prefix: '/notes'
})
  .get('/:noteId', async ({ params: { noteId }, set }) => {
    const note = await TastingNote.getNote(noteId)

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
      summary: 'Get tasting note by ID'
    },
    response: {
      200: TastingNoteModel.TastingNoteResponse,
      404: t.Object({
        error: t.String()
      })
    }
  })
