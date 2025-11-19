import { relations } from 'drizzle-orm'
import { 
  users, 
  alcohols, 
  alcoholCategories,
  alcoholStyles,
  alcoholLocations,
  alcoholRequests,
  wishes, 
  comments, 
  tastingNotes,
  posts,
  reactions,
  flavorCategories,
  flavorKeywords,
  inquiries,
} from './schema'

// ============ Users Relations ============
export const usersRelations = relations(users, ({ many }) => ({
  alcohols:        many(alcohols),
  wishes:          many(wishes),
  comments:        many(comments),
  tastingNotes:    many(tastingNotes),
  posts:           many(posts),
  reactions:       many(reactions),
  inquiries:       many(inquiries),
  alcoholRequests: many(alcoholRequests),
}))

// ============ Alcohols Relations ============
export const alcoholsRelations = relations(alcohols, ({ one, many }) => ({
  user: one(users, {
    fields: [alcohols.userId],
    references: [users.id]
  }),
  category: one(alcoholCategories, {
    fields: [alcohols.categoryId],
    references: [alcoholCategories.id]
  }),
  style: one(alcoholStyles, {
    fields: [alcohols.styleId],
    references: [alcoholStyles.id]
  }),
  location: one(alcoholLocations, {
    fields: [alcohols.locationId],
    references: [alcoholLocations.id]
  }),
  wishes:       many(wishes),
  tastingNotes: many(tastingNotes)
}))

// ============ Alcohol Categories Relations ============
export const alcoholCategoriesRelations = relations(alcoholCategories, ({ many }) => ({
  styles:   many(alcoholStyles),
  alcohols: many(alcohols),
  alcoholRequests: many(alcoholRequests)
}))

// ============ Alcohol Styles Relations ============
export const alcoholStylesRelations = relations(alcoholStyles, ({ one, many }) => ({
  category: one(alcoholCategories, {
    fields: [alcoholStyles.categoryId],
    references: [alcoholCategories.id]
  }),
  alcohols: many(alcohols)
}))

// ============ Alcohol Locations Relations ============
export const alcoholLocationsRelations = relations(alcoholLocations, ({ many }) => ({
  alcohols: many(alcohols),
  alcoholRequests: many(alcoholRequests)
}))

// ============ Alcohol Requests Relations ============
export const alcoholRequestsRelations = relations(alcoholRequests, ({ one }) => ({
  user: one(users, {
    fields: [alcoholRequests.userId],
    references: [users.id]
  }),
  category: one(alcoholCategories, {
    fields: [alcoholRequests.categoryId],
    references: [alcoholCategories.id]
  }),
  style: one(alcoholStyles, {
    fields: [alcoholRequests.styleId],
    references: [alcoholStyles.id]
  }),
  location: one(alcoholLocations, {
    fields: [alcoholRequests.locationId],
    references: [alcoholLocations.id]
  })
}))

// ============ Flavor Categories Relations ============
export const flavorCategoriesRelations = relations(flavorCategories, ({ many }) => ({
  keywords: many(flavorKeywords)
}))

// ============ Flavor Keywords Relations ============
export const flavorKeywordsRelations = relations(flavorKeywords, ({ one }) => ({
  category: one(flavorCategories, {
    fields: [flavorKeywords.categoryId],
    references: [flavorCategories.id]
  })
}))

// ============ Wishes Relations ============
export const wishesRelations = relations(wishes, ({ one }) => ({
  user: one(users, {
    fields: [wishes.userId],
    references: [users.id]
  }),
  alcohol: one(alcohols, {
    fields: [wishes.alcoholId],
    references: [alcohols.id]
  })
}))

// ============ Comments Relations ============
export const commentsRelations = relations(comments, ({ one, many }) => ({
  user: one(users, {
    fields: [comments.userId],
    references: [users.id]
  }),
  parent: one(comments, {
    fields: [comments.parentId],
    references: [comments.id]
  }),
  replies: many(comments)
}))

// ============ Tasting Notes Relations ============
export const tastingNotesRelations = relations(tastingNotes, ({ one }) => ({
  alcohol: one(alcohols, {
    fields: [tastingNotes.alcoholId],
    references: [alcohols.id]
  }),
  user: one(users, {
    fields: [tastingNotes.userId],
    references: [users.id]
  })
}))

// ============ Posts Relations ============
export const postsRelations = relations(posts, ({ one }) => ({
  user: one(users, {
    fields: [posts.userId],
    references: [users.id]
  })
}))

// ============ Reactions Relations ============
export const reactionsRelations = relations(reactions, ({ one }) => ({
  user: one(users, {
    fields: [reactions.userId],
    references: [users.id]
  })
}))

// ============ Inquiries Relations ============
export const inquiriesRelations = relations(inquiries, ({ one }) => ({
  writer: one(users, {
    fields: [inquiries.userId],
    references: [users.id]
  })
}))