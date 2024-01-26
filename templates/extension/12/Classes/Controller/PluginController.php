<?php

declare(strict_types=1);

namespace TYPOCONSULT\extensionNamePascal\Controller;

use Psr\Http\Message\ResponseInterface;
use TYPO3\CMS\Core\Http\HtmlResponse;
use TYPO3\CMS\Core\Http\NullResponse;
use TYPO3\CMS\Extbase\Mvc\Controller\ActionController;
use TYPOCONSULT\extensionNamePascal\Domain\Repository\ContentRepository;

class PluginController extends ActionController
{
    public function __construct(protected ContentRepository $contentRepository)
    {
    }

    /**
     * @return ResponseInterface
     */
    public function showAction(): ResponseInterface
    {
        $uid = $this->request->getAttribute('currentContentObject')->data['uid'] ?? 0;
        $content = $this->contentRepository->findByUid($uid);

        if (!$content) {
            return new NullResponse();
        }

        $this->view->assignMultiple([
            'content' => $content
        ]);

        return new HtmlResponse($this->view->render());
    }
}
