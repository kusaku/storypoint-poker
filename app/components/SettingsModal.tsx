'use client'

import { TABLE_PALETTES } from '@/app/appearance'
import { Dialog } from '@/app/components/Dialog'
import { Icon } from '@/app/components/Icon'
import { SelectControl } from '@/app/components/SelectControl'
import { useTheme } from '@/app/theme-provider'
import { useLanguage } from '@/app/i18n/language-provider'
import { getLanguages, isLanguageCode } from '@/app/i18n/translations'

const themes = [
  { value: 'light', icon: 'sun' },
  { value: 'dark', icon: 'moon' },
  { value: 'auto', icon: 'monitor' },
] as const

export function SettingsModal({ onClose }: { onClose: () => void }) {
  const { theme, setTheme, palette, setPalette } = useTheme()
  const { language, setLanguage, t } = useLanguage()

  return (
    <Dialog title={t('common.settings')} onClose={onClose}>
      <div className="settings-form">
        <fieldset className="field">
          <legend>{t('common.theme')}</legend>
          <div className="segmented">
            {themes.map(({ value, icon }) => (
              <button key={value} type="button" aria-pressed={theme === value} onClick={() => setTheme(value)}>
                <Icon name={icon} size={16} />
                {t('common.' + value)}
              </button>
            ))}
          </div>
        </fieldset>
        <fieldset className="field">
          <legend>{t('appearance.tableColor')}</legend>
          <div className="palette-options">
            {TABLE_PALETTES.map((value) => (
              <button
                key={value}
                className="palette-option"
                type="button"
                aria-pressed={palette === value}
                onClick={() => setPalette(value)}
              >
                <span className="palette-swatch" data-palette-preview={value} aria-hidden="true">
                  {palette === value && <Icon name="check" size={17} />}
                </span>
                <span>{t('appearance.' + value)}</span>
              </button>
            ))}
          </div>
        </fieldset>
        <label className="field">
          {t('common.language')}
          <SelectControl
            value={language}
            onChange={(event) => {
              if (isLanguageCode(event.target.value)) setLanguage(event.target.value)
            }}
          >
            {getLanguages().map(({ code, nativeName, flag }) => (
              <option key={code} value={code} lang={code}>{flag} {nativeName}</option>
            ))}
          </SelectControl>
        </label>
      </div>
    </Dialog>
  )
}
