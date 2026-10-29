import { sqliteTable, text, integer, primaryKey } from 'drizzle-orm/sqlite-core';
export const fitnessRecords = sqliteTable('fitness_records', {
  userId: text('user_id').notNull(), collection: text('collection').notNull(), recordKey: text('record_key').notNull(),
  valueJson: text('value_json').notNull(), updatedAt: text('updated_at').notNull(), version: integer('version').notNull().default(1), lastOperation: text('last_operation').notNull()
}, t => [primaryKey({columns:[t.userId,t.collection,t.recordKey]})]);
export const fitnessChanges = sqliteTable('fitness_changes', {
  userId: text('user_id').notNull(), operationId:text('operation_id').notNull(), collection:text('collection').notNull(), recordKey:text('record_key').notNull(),
  valueJson:text('value_json').notNull(),createdAt:text('created_at').notNull(),applied:integer('applied').notNull().default(0)
}, t => [primaryKey({columns:[t.userId,t.operationId]})]);
