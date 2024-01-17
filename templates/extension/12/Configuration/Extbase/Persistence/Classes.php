<?php

declare(strict_types=1);

use TYPOCONSULT\ExtensionNamePascal\Domain\Model\Content;

return [
    Content::class => [
        'tableName' => Content::TABLE_NAME,
        'properties' => [
            'modelProperty' => [
                'fieldName' => 'extensionNamePrefixed_field'
            ]
        ]
    ]
];
