<?php

declare(strict_types=1);

namespace TYPOCONSULT\ExtensionNamePascal\Controller;

use TYPO3\CMS\Core\Http\HtmlResponse;
use TYPO3\CMS\Extbase\Mvc\Controller\ActionController;
use TYPOCONSULT\ExtensionNamePascal\Domain\Repository\ContentRepository;

class PluginController extends ActionController
{
    private array $cObjData = [];

    public function __construct(protected ContentRepository $contentRepository) {}

    public function initializeAction(): void
    {
        $this->cObjData = $this->request->getAttribute('currentContentObject')->data;
    }

    public function showAction(): HtmlResponse
    {
        $content = $this->contentRepository->findByUid($this->cObjData['uid']);

        if ($content) {
            $this->view->assign('content', $content);
        }

        return new HtmlResponse($this->view->render());
    }
}
