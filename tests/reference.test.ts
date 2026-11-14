import {it,expect} from 'vitest';
import bank from './question-bank.json';
it.each(bank.questions)('user question-bank reference: $id has one distinct answer and explanation',q=>{expect(q.options).toHaveLength(4);expect(new Set(q.options).size).toBe(4);expect(q.options.filter(o=>o===q.answer)).toHaveLength(1);expect(q.explanation.length).toBeGreaterThan(25);});
