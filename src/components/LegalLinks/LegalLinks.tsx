import { useTranslation } from 'react-i18next'
import { legalLinksNs } from './locals'
import './locals'

const privacyPolicyUrl = import.meta.env.VITE_PRIVACY_POLICY_URL
const supportUrl = import.meta.env.VITE_SUPPORT_URL

export function LegalLinks() {
  const { t } = useTranslation(legalLinksNs)

  if (!privacyPolicyUrl && !supportUrl) return null

  return (
    <div className='legal-links-container'>
      {privacyPolicyUrl ? (
        <a
          href={privacyPolicyUrl}
          target='_blank'
          rel='noopener noreferrer'
        >
          {t('privacyPolicy')}
        </a>
      ) : null}
      {supportUrl ? (
        <a href={supportUrl} target='_blank' rel='noopener noreferrer'>
          {t('support')}
        </a>
      ) : null}
    </div>
  )
}
