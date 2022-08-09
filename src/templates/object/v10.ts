import { ObjectTemplate } from '../../types/object.types';

const template: ObjectTemplate = {
    append: {
        'Resources/Private/Language/da.locallang_db.xlf': {
            content: `
                <trans-unit id="{{objectTableName}}">
                    <target>{{objectNamePascal}}</target>
                </trans-unit>
                <trans-unit id="{{objectTableName}}.title">
                    <target>Titel</target>
                </trans-unit>
            `,
            insertBefore: '</body>'
        },
        'Resources/Private/Language/locallang_db.xlf': {
            content: `
                <trans-unit id="{{objectTableName}}">
                    <source>{{objectNamePascal}}</source>
                </trans-unit>
                <trans-unit id="{{objectTableName}}.title">
                    <source>Title</source>
                </trans-unit>
            `,
            insertBefore: '</body>'
        },
        'ext_tables.sql': {
            // @formatter:off
            content: `
                CREATE TABLE {{objectTableName}}
                (
                    title VARCHAR(255) DEFAULT '' NOT NULL
                );
            `,
            insertAtEndOfFile: true
            // @formatter:on
        }
    },
    create: {
        'Classes/Domain/Model/{{objectNamePascal}}.php': `
            <?php
            
            declare(strict_types=1);
        
            namespace TYPOCONSULT\\{{extensionNamePascal}}\\Domain\\Model;

            use TYPO3\\CMS\\Extbase\\DomainObject\\AbstractEntity;
            
            class {{objectNamePascal}} extends AbstractEntity
            {
                public const TABLE_NAME = '{{objectTableName}}';
                
                ####################
                ## Helper methods ##
                ####################
                
                /**
                 * @return string
                 */
                public function getCode(): string
                {
                    return md5(get_class($this) . $this->uid . $GLOBALS['TYPO3_CONF_VARS']['SYS']['encryptionKey']);
                }
            }
        `,
        'Classes/Domain/Repository/{{objectNamePascal}}Repository.php': `
            <?php
            
            declare(strict_types=1);
        
            namespace TYPOCONSULT\\{{extensionNamePascal}}\\Domain\\Repository;
            
            use TYPO3\\CMS\\Extbase\\Persistence\\Repository;
            use TYPOCONSULT\\{{extensionNamePascal}}\\Domain\\Model\\{{objectNamePascal}};
            
            class {{objectNamePascal}}Repository extends Repository
            {
                /**
                 * @param int $uid
                 *
                 * @return {{objectNamePascal}}|null
                 */
                public function findByUid($uid): ?{{objectNamePascal}}
                {
                    $query = $this->createQuery();
                    $query->getQuerySettings()->setRespectSysLanguage(false);
                    $query->getQuerySettings()->setRespectStoragePage(false);
            
                    $query->matching(
                        $query->equals('uid', $uid)
                    );
            
                    $result = $query->execute()->getFirst();
            
                    if ($result instanceof {{objectNamePascal}}) {
                        return $result;
                    }
            
                    return null;
                }
            
                /**
                 * @param int $uid
                 *
                 * @return {{objectNamePascal}}|null
                 */
                public function findByUidRaw(int $uid): ?{{objectNamePascal}}
                {
                    $query = $this->createQuery();
                    $query->getQuerySettings()->setRespectSysLanguage(false);
                    $query->getQuerySettings()->setRespectStoragePage(false);
                    $query->getQuerySettings()->setIgnoreEnableFields(true);
            
                    $query->matching(
                        $query->equals('uid', $uid)
                    );
            
                    $result = $query->execute()->getFirst();
            
                    if ($result instanceof {{objectNamePascal}}) {
                        return $result;
                    }
            
                    return null;
                }
            }
        `,
        'Configuration/TCA/{{objectTableName}}.php': `
            <?php

            defined('TYPO3_MODE') || die('Access denied.');
            
            $extKey = '{{extensionNameSnake}}';
            $table = \\TYPOCONSULT\\{{extensionNamePascal}}\\Domain\\Model\\{{objectNamePascal}}::TABLE_NAME;
            $labelPrefix = "LLL:EXT:$extKey/Resources/Private/Language/locallang_db.xlf:$table";
            
            return [
                'ctrl' => [
                    'title' => $labelPrefix,
                    'label' => 'title',
                    'tstamp' => 'tstamp',
                    'crdate' => 'crdate',
                    'cruser_id' => 'cruser_id',
                    'delete' => 'deleted',
                    'searchFields' => 'title',
                    'typeicon_classes' => ['default' => $table]
                ],
                'types' => [
                    '1' => [
                        'showitem' => '--palette--;;general'
                    ]
                ],
                'palettes' => [
                    'general' => ['showitem' => 'title']
                ],
                'columns' => [
                    'title' => [
                        'label' => "$labelPrefix.title",
                        'config' => [
                            'type' => 'input',
                            'size' => 40,
                            'max' => 255,
                            'eval' => 'required,trim'
                        ]
                    ]
                ]
            ];
        `,
        'Resources/Public/Icons/{{objectTableName}}.svg': `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
                <circle fill="#f2f2f2" cx="50%" cy="50%" r="45%" stroke="{{randomHexColor}}" stroke-width="3"/>
            </svg>
        `
    }
};

export default template;
