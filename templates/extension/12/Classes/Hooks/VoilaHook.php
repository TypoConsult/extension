<?php

declare(strict_types=1);

namespace TYPOCONSULT\ExtensionNamePascal\Hooks;

use TYPO3\CMS\Core\Utility\GeneralUtility;
use TYPOCONSULT\ExtensionNamePascal\Domain\Model\Content;
use TYPOCONSULT\ExtensionNamePascal\Domain\Repository\ContentRepository;
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

        $contentRepository = GeneralUtility::makeInstance(ContentRepository::class);
        /** @var Content $element */
        $element = $contentRepository->findByUidRaw($params['element']->getUid());

        if (!$element) {
            return '';
        }

        if ($element->getBodytext()) {
            $previewItems[] = VoilaUtility::renderBodytext($element);
        }

        return implode('', $previewItems);
    }
}
