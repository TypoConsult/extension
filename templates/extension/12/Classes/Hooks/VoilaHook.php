<?php

declare(strict_types=1);

namespace TYPOCONSULT\extensionNamePascal\Hooks;

use TYPO3\CMS\Core\Utility\GeneralUtility;
use TYPOCONSULT\extensionNamePascal\Domain\Model\Content;
use TYPOCONSULT\extensionNamePascal\Domain\Repository\ContentRepository;
use TYPOCONSULT\TcSys\Utility\VoilaUtility;

class VoilaHook
{
    /**
     * @param array $params
     *
     * @return string
     */
    public function addAdditionalPreview(array $params): string
    {
        $previewItems = [];

        if ($params['element']->getCtype() !== 'extensionNameClean_plugin') {
            return '';
        }

        /** @var Content $element */
        $element = GeneralUtility::makeInstance(ContentRepository::class)->findByUidRaw($params['element']->getUid());

        if (!$element) {
            return '';
        }

        if ($element->getBodytext()) {
            $previewItems[] = VoilaUtility::renderBodytext($element);
        }

        return implode($previewItems);
    }
}
