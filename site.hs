--------------------------------------------------------------------------------
{-# LANGUAGE OverloadedStrings #-}
import           Control.Applicative ((<$>), (<*>))
import           Control.Monad       (forM_)
import           Data.Monoid         (mappend, mempty)
import           Data.Maybe          (catMaybes, fromMaybe, listToMaybe, maybeToList)
import qualified Data.Map            as M
import           Data.Time.Clock
import           Data.Time.Clock.POSIX
import           Data.Time.Format
import           System.Posix.Files
import           System.Locale
import           Utils
import           RouteFactories
import           Data.List
import           Hakyll

--------------------------------------------------------------------------------
main :: IO ()
main = hakyll $ do

--------------------------------------------------------------------------------
-- Assets
    match "assets/img/**" $ do
        route   idRoute
        compile copyFileCompiler

    match "clevercloud/**" $ do
        route   idRoute
        compile copyFileCompiler

    match "assets/fonts/**" $ do
        route   idRoute
        compile copyFileCompiler
    
    match "assets/js/**" $ do
        route   idRoute
        compile copyFileCompiler

    match "assets/css/**.less" $ do
        compile $ getResourceBody 

    d <- makePatternDependency $ "assets/css/**.less"
    rulesExtraDependencies [d] $ create ["assets/css/main.css"] $ do
       route idRoute
       compile $ 
        loadBody "assets/css/all.less"
        >>= makeItem
        >>= withItemBody (unixFilter "lessc" ["-","--yui-compress","-O2"])

    createSitemap $ loadAll ("en/**/*.md" .||. "fr/**/*.md" .||. "fr/*.html" .||. "en/*.html")    --(((++) (++) <$> (loadAll "en/**/*.md") <*> (loadAll "fr/**/*.md") 
--------------------------------------------------------------------------------
-- Reusable blocks
--

    forM_ langs $ \lang ->
        match (fromGlob $ lang ++ "/blocks/*.md") $ do
        compile $ pandocCompiler

    forM_ langs $ \lang ->
        match (fromGlob $ lang ++ "/blocks/*.html") $ do
        compile $ getResourceBody

--------------------------------------------------------------------------------
-- Simple pages
--
    forM_ langs makeSinglePages

--------------------------------------------------------------------------------
-- Runtimes
--
    forM_ langs makeRuntimePages
    forM_ langs makeServicePages
    forM_ langs makeAddOnsPages

    forM_ langs $ \lang ->
        match (fromGlob $ lang ++ "/techs/*.md") $ do
        compile $ pandocCompiler

--------------------------------------------------------------------------------
-- Services
--
    --forM_ langs makeServicePages

    --forM_ langs $ \lang ->
      --  match (fromGlob $ lang ++ "/techs/*.md") $ do
        --compile $ pandocCompiler

--------------------------------------------------------------------------------
-- Index
--
    forM_ langs $ \lang ->
        match (fromGlob $ lang ++ "/index.html") $ do
            route langRoute
            compile $ getResourceBody
                >>= loadAndApplyTemplate "templates/index.html" (globalContext lang)
                >>= loadAndApplyTemplate "templates/default.html" (globalContext lang)
                >>= relativizeUrls
                

--------------------------------------------------------------------------------
-- pricing
--
    forM_ langs $ \lang ->
        match (fromGlob $ lang ++ "/pricing.html") $ do
            route langRoute
            compile $ getResourceBody
                >>= loadAndApplyTemplate "templates/pricing.html" (globalContext lang)
                >>= loadAndApplyTemplate "templates/default.html" (globalContext lang)
                >>= relativizeUrls

--------------------------------------------------------------------------------
-- compatibility
--
    forM_ langs $ \lang ->
        match (fromGlob $ lang ++ "/compatibility.html") $ do
            route langRoute
            compile $ getResourceBody
                >>= loadAndApplyTemplate "templates/compatibility.html" (globalContext lang)
                >>= loadAndApplyTemplate "templates/default.html" (globalContext lang)
                >>= relativizeUrls

--------------------------------------------------------------------------------
-- team
--
    forM_ langs $ \lang ->
        match (fromGlob $ lang ++ "/team.html") $ do
            route langRoute
            compile $ getResourceBody
                >>= loadAndApplyTemplate "templates/team.html" (globalContext lang)
                >>= loadAndApplyTemplate "templates/default.html" (globalContext lang)
                >>= relativizeUrls

--------------------------------------------------------------------------------
-- hello page
--
    forM_ langs $ \lang ->
        match (fromGlob $ lang ++ "/hello.html") $ do
            route langRoute
            compile $ getResourceBody
                >>= loadAndApplyTemplate "templates/hello.html" (globalContext lang)
                >>= relativizeUrls

--------------------------------------------------------------------------------
-- Compile all templates
--
    match "templates/**" $ compile templateCompiler

--------------------------------------------------------------------------------
createSitemap :: Compiler [Item String] -> Rules ()
createSitemap pages =
    create ["sitemap.xml"] $ do
        route idRoute
        compile $ do
            let urlCtx = field "urls" (\_ -> urlList pages) `mappend` defaultContext
            makeItem ""
                >>= loadAndApplyTemplate "templates/sitemap.xml" urlCtx

urlList :: Compiler [Item String] -> Compiler String
urlList compPosts = do
    posts <- compPosts
    applyUrlTemplateList posts

applyUrlTemplateList :: [Item String] -> Compiler String
applyUrlTemplateList posts = do
    items  <- mapM applyUrlTemplate posts
    return $ concat $ intersperse "" $ map itemBody items

applyUrlTemplate :: Item String -> Compiler (Item String)
applyUrlTemplate item = do
    tpl  <- urlTemplate item
    applyTemplate tpl urlCtx item

urlTemplate ::  Item a -> Compiler Template
urlTemplate item = do
    metadata  <- getMetadata . itemIdentifier $ item
    loadBody "templates/sitemap_element.xml"
    
getFullUrl :: String -> (Item a) -> Compiler String
getFullUrl root item = do
    mbPath <- getRoute.itemIdentifier $ item
    let fullUrl = case mbPath of
         Nothing  -> ""
         Just url -> (root ++) . toUrl $ url
    return fullUrl

getModificationTime :: (Item a) -> Compiler String
getModificationTime item = do
    let filePath = toFilePath . itemIdentifier $ item
    fileStatus <- unsafeCompiler . getFileStatus $ filePath
    let modTime = posixSecondsToUTCTime . realToFrac . modificationTime $ fileStatus
    let str = formatTime defaultTimeLocale "%Y-%m-%dT%H:%M:%S+00:00" modTime
    return str

urlCtx :: Context String
urlCtx =
    (field "url" $ getFullUrl "http://www.clever-cloud.com")
    `mappend` (field "last_modified" getModificationTime)
    `mappend` dateField "date" "%B %e, %Y"
    `mappend` defaultContext