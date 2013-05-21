{-# LANGUAGE OverloadedStrings #-}
module RouteFactories where

import           Data.List               (concat, intercalate)
import qualified Data.Map                as M
import           Data.Maybe              (fromMaybe)
import           Data.Monoid             (mappend, mconcat, mempty)
import           Data.Time.Clock         (UTCTime (..))
import           Data.Time.LocalTime     (LocalTime, hoursToTimeZone, localTimeToUTC)
import           Data.Time.Format        (formatTime, parseTime)
import           System.FilePath         (joinPath, replaceExtension, splitDirectories)
import           System.Locale           (TimeLocale, defaultTimeLocale)

import Hakyll
import CustomTags
import Utils

langs = ["fr", "en"]
defaultLang = "fr"

langRoute = gsubRoute (defaultLang ++ "/") (const "")

getMetaDescription :: String -> String
getMetaDescription "fr" = "Clever Cloud est une plateforme Cloud qui permet d'assurer hautes performances et simplicité pour votre hébergement web"
getMetaDescription _ = "Clever Cloud is a next-gen Cloud computing platform able to scale websites and apps automatically"

globalContext lang =
    blockLoader lang `mappend`
    constField "urllang" (if (lang == defaultLang) then "" else lang ++ "/") `mappend`
    constField "lang" lang `mappend`
    constField "metaDescription" (getMetaDescription lang) `mappend`
    defaultContext

getBlock :: String -> [String] -> (Context String) -> Compiler String
getBlock lang args ctx = let
        invertLangCtx = constField "ilang" . invertLang
        blockContext identifier = (invertLangCtx identifier) `mappend` ctx `mappend` defaultContext
        [name, fmt] = args
    in do
    identifier <- getUnderlying
    tpl <- loadBody $ fromFilePath ("templates/blocks/"++ name ++".html")
    content <- load $ fromFilePath (lang ++ "/blocks/"++ name ++ "." ++ fmt)
    compiledBlock <- applyTemplate tpl (blockContext $ show identifier) content
    return $ itemBody compiledBlock

blockLoader :: String -> Context String
blockLoader lang =
    functionField "block" (\args item -> getBlock lang args (globalContext lang))

invertLang :: FilePath -> FilePath
invertLang = joinPath . il . removePage . splitDirectories . getPath
    where
        getPath = (flip replaceExtension "html")
        removePage = filter (/= "pages")
        il ("fr":xs) = if("en" /= defaultLang) then "en":xs else xs
        il ("en":xs) = if("fr" /= defaultLang) then "fr":xs else xs
        il xs         = xs

makeSinglePages :: String -> Rules ()
makeSinglePages lang =
    let r = gsubRoute ("pages/") (const "")
    in
        match (fromGlob $ lang ++ "/pages/*.md") $ do
        route $ r `composeRoutes` (setExtension "html") `composeRoutes` langRoute
        compile $ pandocCompiler
            >>= loadAndApplyTemplate "templates/page.html" (globalContext lang)
            >>= loadAndApplyTemplate "templates/default.html" (globalContext lang)
            >>= relativizeUrls

makeRuntimePages :: String -> Rules ()
makeRuntimePages lang =
    match (fromGlob $ lang ++ "/runtimes/*.md") $ do
    route $ (setExtension "html") `composeRoutes` langRoute
    compile $ pandocCompiler
        >>= loadAndApplyTemplate "templates/runtime.html" ctx
        >>= loadAndApplyTemplate "templates/default.html" ctx
        >>= relativizeUrls
  where
    ctx = globalContext lang `mappend`
          field "techs" makeTechsField
    makeTechsField runtimeItem = do
        ids <- loadAll (fromGlob $ lang ++ "/techs/*.md")
        techs <- getWithTag "runtimes" (itemIdFromItem runtimeItem) ids
        techTemplate <- loadBody "templates/tech.html"
        applyTemplateList techTemplate (globalContext lang) techs

makeServicePages :: String -> Rules ()
makeServicePages lang =
    match (fromGlob $ lang ++ "/services/*.md") $ do
    route $ (setExtension "html") `composeRoutes` langRoute
    compile $ pandocCompiler
        >>= loadAndApplyTemplate "templates/services.html" ctx
        >>= loadAndApplyTemplate "templates/default.html" ctx
        >>= relativizeUrls
  where
    ctx = globalContext lang `mappend`
          field "techs" makeTechsField
    makeTechsField runtimeItem = do
        ids <- loadAll (fromGlob $ lang ++ "/techs/*.md")
        techs <- getWithTag "services" (itemIdFromItem runtimeItem) ids
        techTemplate <- loadBody "templates/tech.html"
        applyTemplateList techTemplate (globalContext lang) techs

makeAddOnsPages :: String -> Rules ()
makeAddOnsPages lang =
    match (fromGlob $ lang ++ "/add-ons/*.md") $ do
    route $ (setExtension "html") `composeRoutes` langRoute
    compile $ pandocCompiler
        >>= loadAndApplyTemplate "templates/add-ons.html" ctx
        >>= loadAndApplyTemplate "templates/default.html" ctx
        >>= relativizeUrls
  where
    ctx = globalContext lang `mappend`
          field "techs" makeTechsField
    makeTechsField runtimeItem = do
        ids <- loadAll (fromGlob $ lang ++ "/techs/*.md")
        techs <- getWithTag "addons" (itemIdFromItem runtimeItem) ids
        techTemplate <- loadBody "templates/tech.html"
        applyTemplateList techTemplate (globalContext lang) techs

