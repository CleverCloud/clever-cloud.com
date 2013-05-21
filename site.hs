--------------------------------------------------------------------------------
{-# LANGUAGE OverloadedStrings #-}
import           Control.Applicative ((<$>))
import           Control.Monad       (forM_)
import           Data.Monoid         (mappend, mempty)
import           Data.Maybe          (catMaybes, fromMaybe, listToMaybe, maybeToList)
import qualified Data.Map            as M

import           Utils
import           RouteFactories

import           Hakyll

--------------------------------------------------------------------------------
main :: IO ()
main = hakyll $ do

--------------------------------------------------------------------------------
-- Assets
    match "assets/img/**" $ do
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
-- tour
--
    forM_ langs $ \lang ->
        match (fromGlob $ lang ++ "/tour.html") $ do
            route langRoute
            compile $ getResourceBody
                >>= loadAndApplyTemplate "templates/tour.html" (globalContext lang)
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
-- Compile all templates
--
    match "templates/**" $ compile templateCompiler

--------------------------------------------------------------------------------
