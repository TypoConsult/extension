export default {
    'Classes/Constants/GeneralConstants.php': `
        <?php
    
        declare(strict_types=1);
        
        namespace TYPOCONSULT\\{{extensionNamePascal}}\\Constants;
        
        class GeneralConstants
        {
            public const EXT_KEY = '{{extensionNameSnake}}';
        }
    `,
    'Classes/Controller/PluginController.php': `
        <?php

        declare(strict_types=1);
        
        namespace TYPOCONSULT\\{{extensionNamePascal}}\\Controller;
        
        use TYPO3\\CMS\\Core\\Http\\HtmlResponse;
        use TYPO3\\CMS\\Extbase\\Mvc\\Controller\\ActionController;
        use TYPOCONSULT\\{{extensionNamePascal}}\\Domain\\Repository\\ContentRepository;
        use TYPOCONSULT\\TcSys\\Utility\\CommonUtility;
        use TYPOCONSULT\\TcSys\\Utility\\PageResourceUtility;
        use TYPOCONSULT\\TcSys\\Utility\\SassCompilerUtility;
        
        class PluginController extends ActionController
        {
            private array $cObjData = [];
            
            public function __construct(protected ContentRepository $contentRepository) {}
        
            public function initializeAction(): void
            {
                $this->cObjData = $this->configurationManager->getContentObject()->data;
            }
        
            public function showAction(): HtmlResponse
            {
                $content = $this->contentRepository->findByUid($this->cObjData['uid']);
        
                if ($content) {
                    $this->view->assign('content', $content);
        
                    $this->renderStyles();
                    $this->renderScript();
                }
                
                return new HtmlResponse($this->view->render());
            }
        
            private function renderStyles(): void
            {
                $GLOBALS['TSFE']->pSetup['styles.']['variables.'] = array_merge(
                    $GLOBALS['TSFE']->pSetup['styles.']['variables.'],
                    [
                        'className' => $this->settings['className']
                    ]
                );
                
                $styles = array_map(function ($path) {
                    return SassCompilerUtility::process($path);
                }, $this->settings['stylesPaths'] ?? []);
        
                PageResourceUtility::addStyleBlock(
                    CommonUtility::getUniqueNumberFromString(get_class($this)),
                    implode('', $styles),
                    ['mode' => 'inline']
                );
            }
        
            private function renderScript(): void
            {
                $search = [
                    '###tabletMinWidth###',
                    '###tabletMaxWidth###'
                ];
    
                $replace = [
                    intval($this->settings['tabletMinWidth']),
                    intval($this->settings['tabletMaxWidth'])
                ];
                
                $script = array_map(function ($path) {
                    return file_get_contents(CommonUtility::getPath($path));
                }, $this->settings['javascriptPaths'] ?? []);
        
                PageResourceUtility::addScriptBlock(
                    CommonUtility::getUniqueNumberFromString(get_class($this)),
                    str_replace($search, $replace, implode('', $script)),
                    ['mode' => 'inline']
                );
            }
        }
    `,
    'Classes/Domain/Model/Content.php': `
        <?php

        declare(strict_types=1);
        
        namespace TYPOCONSULT\\{{extensionNamePascal}}\\Domain\\Model;
        
        class Content extends \\TYPOCONSULT\\TcSys\\Domain\\Model\\Content {}
    `,
    'Classes/Domain/Repository/ContentRepository.php': `
        <?php

        declare(strict_types=1);
        
        namespace TYPOCONSULT\\{{extensionNamePascal}}\\Domain\\Repository;
        
        use TYPO3\\CMS\\Extbase\\Persistence\\Repository;
        use TYPOCONSULT\\{{extensionNamePascal}}\\Domain\\Model\\Content;
        
        class ContentRepository extends Repository
        {
            /**
             * @param $uid
             *
             * @return Content|null
             */
            public function findByUid($uid): ?Content
            {
                $query = $this->createQuery();
        
                $query->getQuerySettings()->setRespectSysLanguage(false);
                $query->getQuerySettings()->setRespectStoragePage(false);
        
                $query->matching(
                    $query->equals('uid', $uid)
                );
        
                $result = $query->execute()->getFirst();
        
                if ($result instanceof Content) {
                    return $result;
                }
        
                return null;
            }
        
            /**
             * @param int $uid
             *
             * @return Content|null
             */
            public function findByUidRaw(int $uid): ?Content
            {
                $query = $this->createQuery();
        
                $query->getQuerySettings()->setRespectSysLanguage(false);
                $query->getQuerySettings()->setRespectStoragePage(false);
                $query->getQuerySettings()->setIgnoreEnableFields(true);
        
                $query->matching(
                    $query->equals('uid', $uid)
                );
        
                $result = $query->execute()->getFirst();
        
                if ($result instanceof Content) {
                    return $result;
                }
        
                return null;
            }
        }
    `,
    'Classes/Hooks/VoilaHook.php': `
        <?php

        declare(strict_types=1);
        
        namespace TYPOCONSULT\\{{extensionNamePascal}}\\Hooks;
        
        use TYPO3\\CMS\\Core\\Utility\\GeneralUtility;
        use TYPOCONSULT\\{{extensionNamePascal}}\\Domain\\Repository\\ContentRepository;
        use TYPOCONSULT\\TcSys\\Utility\\VoilaUtility;
        
        class VoilaHook
        {
            /**
             * @param array $params
             *
             * @return string
             */
            public function addAdditionalPreview(array $params): string
            {
                $preview = '';
        
                if ($params['element']->getCtype() == '{{extensionNameClean}}_plugin') {
                    $contentRepository = GeneralUtility::makeInstance(ContentRepository::class);
                    $element = $contentRepository->findByUidRaw($params['element']->getUid());
        
                    if ($element) {
                        if ($element->getBodytext()) {
                            $preview .= VoilaUtility::renderBodytext($element);
                        }
                    }
                }
        
                return $preview;
            }
        }
    `,
    'Configuration/Extbase/Persistence/Classes.php': `
        <?php

        declare(strict_types=1);
        
        return [
            TYPOCONSULT\\{{extensionNamePascal}}\\Domain\\Model\\Content::class => [
                'tableName' => \\TYPOCONSULT\\TcSys\\Domain\\Model\\Content::TABLE_NAME,
                'properties' => [
                    'modelProperty' => [
                        'fieldName' => '{{extensionNamePrefixed}}_field'
                    ]
                ]
            ]
        ];
    `,
    'Configuration/TCA/Overrides/sys_template.php': `
        <?php

        defined('TYPO3') or die('Access denied.');
        
        \\TYPO3\\CMS\\Core\\Utility\\ExtensionManagementUtility::addStaticFile(
            \\TYPOCONSULT\\{{extensionNamePascal}}\\Constants\\GeneralConstants::EXT_KEY,
            'Configuration/TypoScript/',
            '{{extensionNamePretty}}'
        );
    `,
    'Configuration/TCA/Overrides/tt_content.php': `
        <?php

        defined('TYPO3') or die('Access denied.');
        
        $extKey = \\TYPOCONSULT\\{{extensionNamePascal}}\\Constants\\GeneralConstants::EXT_KEY;
        $table = \\TYPOCONSULT\\TcSys\\Domain\\Model\\Content::TABLE_NAME;
        $labelPrefix = "LLL:EXT:$extKey/Resources/Private/Language/locallang_db.xlf:$table";
        
        $pluginName = '{{extensionNameClean}}_plugin';
        $pluginIcon = "extensions-$pluginName";
        
        // Inherit the look and feel of the text element so that we have header and bodytext
        $GLOBALS['TCA'][$table]['types'][$pluginName] = $GLOBALS['TCA'][$table]['types']['text'];
        
        // Add content typeicon_classes
        $GLOBALS['TCA'][$table]['ctrl']['typeicon_classes'] = array_merge(
            $GLOBALS['TCA'][$table]['ctrl']['typeicon_classes'],
            [$pluginName => $pluginIcon]
        );
        
        // Tell TYPO3 about this plugin
        \\TYPO3\\CMS\\Extbase\\Utility\\ExtensionUtility::registerPlugin(
            '{{extensionNamePascal}}',
            'Plugin',
            "$labelPrefix.$pluginName.name",
            $pluginIcon
        );
    `,
    'Configuration/TypoScript/constants.typoscript': `
        plugin {
            {{extensionNamePrefixed}} {
                view {
                    templateRootPath = EXT:{{extensionNameSnake}}/Resources/Private/Templates/
                    partialRootPath = EXT:{{extensionNameSnake}}/Resources/Private/Partials/
                    layoutRootPath = EXT:{{extensionNameSnake}}/Resources/Private/Layouts/
                }
        
                settings {
                    stylesPaths {
                        10 = EXT:{{extensionNameSnake}}/Resources/Private/StyleSheets/general.scss
                    }
        
                    javascriptPaths {
                        10 = EXT:{{extensionNameSnake}}/Resources/Private/JavaScripts/general.js
                    }
        
                    className = tx-{{extensionNameKebab}}
                }
        
                persistence {
                    storagePid =
                }
            }
        }
    `,
    'Configuration/TypoScript/setup.typoscript': `
        lib {
            contentElement {
                settings {
                    addClass {
                        {{extensionNameClean}}_plugin = {$plugin.{{extensionNamePrefixed}}.settings.className}
                    }
                }
            }
        }
        
        plugin {
            {{extensionNamePrefixed}} {
                view {
                    templateRootPaths {
                        10 = {$plugin.{{extensionNamePrefixed}}.view.templateRootPath}
                    }
        
                    partialRootPaths {
                        10 = {$plugin.{{extensionNamePrefixed}}.view.partialRootPath}
                    }
        
                    layoutRootPaths {
                        10 = {$plugin.{{extensionNamePrefixed}}.view.layoutRootPath}
                    }
                }
        
                settings {
                    generalWidth = {$styles.variables.generalWidth}
                    tabletMaxWidth = {$styles.variables.tabletMaxWidth}
                    tabletMinWidth = {$styles.variables.tabletMinWidth}
        
                    stylesPaths {
                        10 = {$plugin.{{extensionNamePrefixed}}.settings.stylesPaths.10}
                    }
        
                    javascriptPaths {
                        10 = {$plugin.{{extensionNamePrefixed}}.settings.javascriptPaths.10}
                    }
        
                    className = {$plugin.{{extensionNamePrefixed}}.settings.className}
                }
        
                persistence {
                    storagePid = {$plugin.{{extensionNamePrefixed}}.persistence.storagePid}
                }
            }
        }
    `,
    'Configuration/Services.yaml': `
        services:
          _defaults:
            autowire: true
            autoconfigure: true
            public: false
        
          TYPOCONSULT\\{{extensionNamePascal}}\\:
            resource: '../Classes/*'
    `,
    'Resources/Private/JavaScripts/general.js': `
        ;(function () {
            var tabletMinWidth = parseInt('###tabletMinWidth###');
            var tabletMaxWidth = parseInt('###tabletMaxWidth###');
            var windowWidth = document.getElementsByTagName('body')[0].clientWidth;
        
            function doWhatEver() {
        
            }
        
            document.addEventListener('DOMContentLoaded', function() {
                doWhatEver();
            });
        }());
    `,
    'Resources/Private/Language/da.locallang.xlf': `
        <?xml version="1.0" encoding="UTF-8"?>
        <xliff version="1.2" xmlns="urn:oasis:names:tc:xliff:document:1.2">
            <file datatype="plaintext">
                <header/>
                <body>
                    <trans-unit id="hello.world">
                        <target>Hello World</target>
                    </trans-unit>
                </body>
            </file>
        </xliff>
    `,
    'Resources/Private/Language/da.locallang_db.xlf': `
        <?xml version="1.0" encoding="UTF-8"?>
        <xliff version="1.2" xmlns="urn:oasis:names:tc:xliff:document:1.2">
            <file datatype="plaintext">
                <header/>
                <body>
                    <trans-unit id="tt_content.{{extensionNameClean}}_plugin.name">
                        <target>Titel</target>
                    </trans-unit>
                    <trans-unit id="tt_content.{{extensionNameClean}}_plugin.description">
                        <target>Beskrivelse...</target>
                    </trans-unit>
                </body>
            </file>
        </xliff>
    `,
    'Resources/Private/Language/locallang.xlf': `
        <?xml version="1.0" encoding="UTF-8"?>
        <xliff version="1.2" xmlns="urn:oasis:names:tc:xliff:document:1.2">
            <file datatype="plaintext">
                <header/>
                <body>
                    <trans-unit id="hello.world">
                        <source>Hello World</source>
                    </trans-unit>
                </body>
            </file>
        </xliff>
    `,
    'Resources/Private/Language/locallang_db.xlf': `
        <?xml version="1.0" encoding="UTF-8"?>
        <xliff version="1.2" xmlns="urn:oasis:names:tc:xliff:document:1.2">
            <file datatype="plaintext">
                <header/>
                <body>
                    <trans-unit id="tt_content.{{extensionNameClean}}_plugin.name">
                        <source>Title</source>
                    </trans-unit>
                    <trans-unit id="tt_content.{{extensionNameClean}}_plugin.description">
                        <source>Description...</source>
                    </trans-unit>
                </body>
            </file>
        </xliff>
    `,
    'Resources/Private/Partials/Bodytext.html': `
        <f:variable name="bodytext" value="{content.bodytext}"/>

        <f:if condition="{bodytext}">
            {bodytext -> f:format.html()}
        </f:if>
    `,
    'Resources/Private/StyleSheets/general.scss': `
        .#{$className} {
            display: block;
        }
    `,
    'Resources/Private/Templates/Plugin/Show.html': ``,
    'Resources/Public/Icons/extensions-{{extensionNameClean}}_plugin.svg': `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96">
            <rect fill="#ff8700" height="100%" width="100%"/>
            <path fill="#ffffff" d="m73.371475,28.438l-25.371475,-11.529545l-25.371477,11.536022l-3.128523,1.418522l0,36.272728l25.909088,11.775681l2.590912,1.178864l2.590908,-1.178864l25.909092,-11.775681l0,-36.272728l-3.128525,-1.424999zm-25.371475,-5.836023l19.107956,8.686026l-19.107956,8.68602l-19.114433,-8.68602l19.114433,-8.686026zm-23.318182,40.197958l0,-27.735683l20.72727,9.417953l0,27.735683l-20.72727,-9.417953zm46.636358,0l-20.727268,9.417953l0,-27.735683l20.727268,-9.417953l0,27.735683z"/>
        </svg>
    `,
    'composer.json': `
        {
            "name": "typoconsult/{{extensionNameKebab}}",
            "type": "typo3-cms-extension",
            "autoload": {
                "psr-4": {
                    "TYPOCONSULT\\\\{{extensionNamePascal}}\\\\": "Classes"
                }
            },
            "extra": {
                "typo3/cms": {
                    "extension-key": "{{extensionNameSnake}}"
                }
            },
            "require": {
                "typo3/cms-core": "^12."
            }
        }
    `,
    'ext_emconf.php': `
        <?php

        $EM_CONF[$_EXTKEY] = [
            'title' => '{{extensionNamePretty}}'
        ];
    `,
    'ext_conf_template.txt': `
        # cat=basic/enable; type=options[common,menu,special,forms,plugins]; label=Select the tab for the plugin int the wizard items
        {{extensionNameClean}}_plugin_wizardItemsTab = plugins
    `,
    'Resources/Public/Icons/Extension.svg': `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640">
            <rect fill="#ff8700" height="100%" width="100%"/>
            <text fill="#ffffff" font-family="sans-serif" font-size="320" x="12.5%" y="68.75%" textLength="75%" lengthAdjust="spacingAndGlyphs">TC</text>
        </svg>
    `,
    'ext_localconf.php': `
        <?php

        defined('TYPO3') or die('Access denied.');
        
        (function () {
            $extKey = \\TYPOCONSULT\\{{extensionNamePascal}}\\Constants\\GeneralConstants::EXT_KEY;
            $labelPrefix = "LLL:EXT:$extKey/Resources/Private/Language/locallang_db.xlf:";
            $extConf = \\TYPOCONSULT\\TcSys\\Utility\\CommonUtility::getExtensionConfiguration($extKey);
        
            \\TYPO3\\CMS\\Extbase\\Utility\\ExtensionUtility::configurePlugin(
                '{{extensionNamePascal}}',
                'Plugin',
                [\\TYPOCONSULT\\{{extensionNamePascal}}\\Controller\\PluginController::class => 'show'],
                [],
                \\TYPO3\\CMS\\Extbase\\Utility\\ExtensionUtility::PLUGIN_TYPE_CONTENT_ELEMENT
            );
        
            $pluginName = '{{extensionNameClean}}_plugin';
            $wizardItemsTab = $extConf["{$pluginName}_wizardItemsTab"] ?: 'plugins';
        
            // Add plugin to wizardItems
            \\TYPO3\\CMS\\Core\\Utility\\ExtensionManagementUtility::addPageTSConfig(
                "mod {
                    wizards {
                        newContentElement {
                            wizardItems {
                                $wizardItemsTab {
                                    elements {
                                        $pluginName {
                                            title = {$labelPrefix}tt_content.$pluginName.name
                                            description = {$labelPrefix}tt_content.$pluginName.description
                                            tt_content_defValues {
                                                CType = $pluginName
                                            }
                                        }
                                    }
        
                                    show := addToList($pluginName)
                                }
                            }
                        }
                    }
                }"
            );
        
            // Adding various hooks
            $GLOBALS['TYPO3_CONF_VARS']['EXTCONF']['tc_sys']['addAdditionalPreview'][] = \\TYPOCONSULT\\{{extensionNamePascal}}\\Hooks\\VoilaHook::class . '->addAdditionalPreview';
        })();
    `,
    'ext_tables.sql': ``,
    'ext_tables.php': `
        <?php

        defined('TYPO3') or die('Access denied.');
        
        (function () {
            \\TYPOCONSULT\\TcSys\\Utility\\CommonUtility::loadIcons(
                \\TYPOCONSULT\\{{extensionNamePascal}}\\Constants\\GeneralConstants::EXT_KEY, 
                'Resources/Public/Icons/'
            );
        })();
    `
};
