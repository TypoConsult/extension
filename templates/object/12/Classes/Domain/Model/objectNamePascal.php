<?php

declare(strict_types=1);

namespace TYPOCONSULT\extensionNamePascal\Domain\Model;

use TYPO3\CMS\Extbase\DomainObject\AbstractEntity;

class objectNamePascal extends AbstractEntity
{
    public const TABLE_NAME = 'objectTableName';

    /**
     * @var string
     */
    public string $title = '';

    ######################
    ## Helper functions ##
    ######################

    /**
     * @return string
     */
    public function getCode(): string
    {
        return md5(self::TABLE_NAME . $this->uid . $GLOBALS['TYPO3_CONF_VARS']['SYS']['encryptionKey']);
    }
}
