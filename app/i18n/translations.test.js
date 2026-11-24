const assert = require('node:assert/strict')
const { readdirSync } = require('node:fs')
const { join } = require('node:path')
const { test } = require('node:test')
const wizardOptions = require('../../shared/wizard-options')

const directory = join(__dirname, 'translations')
const locales = readdirSync(directory).filter((file) => file.endsWith('.json')).map((file) => ({
  code: file.slice(0, -5),
  dictionary: require(join(directory, file)),
}))

function labels({ _meta, ...groups }) {
  return Object.fromEntries(Object.entries(groups).flatMap(([group, entries]) =>
    Object.entries(entries).map(([key, value]) => [group + '.' + key, value]),
  ))
}

function placeholders(text) {
  return Array.from(text.matchAll(/\{(\w+)\}/g), ([, name]) => name).sort()
}

test('all locales translate the same labels and preserve interpolation parameters', () => {
  const reference = labels(require('./translations/en.json'))
  const keys = Object.keys(reference).sort()

  for (const { code, dictionary } of locales) {
    assert.equal(dictionary._meta.code, code)
    assert.match(dictionary._meta.flag, /^\p{Regional_Indicator}{2}$/u, code)
    assert.ok(dictionary._meta.nativeName.trim(), code)
    assert.equal(typeof dictionary._meta.rtl, 'boolean', code)

    const localized = labels(dictionary)
    assert.deepEqual(Object.keys(localized).sort(), keys, code)
    for (const key of keys) {
      const context = `${code} ${key}`
      assert.ok(typeof localized[key] === 'string' && localized[key].trim(), context)
      assert.deepEqual(placeholders(localized[key]), placeholders(reference[key]), context)
    }
  }
})

test('all estimation questions and answer choices have a label in every locale', () => {
  const keys = Object.values(wizardOptions).flatMap((groups) =>
    Object.values(groups).flatMap(({ label, options }) => [label, ...options.map((option) => option.label)]),
  )

  for (const { code, dictionary } of locales) {
    const localized = labels(dictionary)
    for (const key of keys) assert.ok(localized[key], `${code} ${key}`)
  }
})
