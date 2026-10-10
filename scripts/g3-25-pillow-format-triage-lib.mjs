/**
 * G3.25: offline, bounded PUBLIC advisory condition-to-input-path review.
 * No payload parsing, unsafe image fuzzing, model import, GPU, network or upgrades.
 * This is a review artifact, NOT an exploitability or safety determination.
 */
const need=(ok,why)=>{if(!ok)throw new Error('G3.25 FAIL CLOSED: '+why);};
const shaOK=x=>typeof x==='string'&&/^[a-f0-9]{64}$/.test(x);
const cases=[
  ['GHSA-3f63-hfp8-52jq','10.2.0','SPECIALIZED_API','ImageMath.eval attacker-controlled environment','ImageMath, not an image codec'],
  ['GHSA-44wm-f244-xhp3','10.3.0','NATIVE_CMS','_imagingcms.c unsafe strcpy; exact app trigger unverified','ICC/ImageCms native extension'],
  ['GHSA-45hq-cxwh-f6vc','12.3.0','FONT_API','BdfFontFile.bdf_char on hostile BDF glyph dimensions','BDF font'],
  ['GHSA-4x4j-2g7c-83w6','12.3.0','DISPLAY_API','ImageShow.WindowsViewer.get_command with unsafe viewer filename','Windows image viewer'],
  ['GHSA-5x94-69rx-g8h2','12.3.0','FONT_API','FontFile.compile large BDF/PCF glyph atlas allocation','BDF/PCF font'],
  ['GHSA-62p4-gmf7-7g93','12.3.0','OTHER_CODEC','McIdas AREA raw mmap row-stride derived from image header','McIdas AREA image (not PNG/JPEG/WebP)'],
  ['GHSA-6r8x-57c9-28j4','12.3.0','PIXEL_OPERATION','Image.paste/Image.crop with extreme signed coordinates','caller-controlled editing coordinates'],
  ['GHSA-8v84-f9pq-wr9x','12.3.0','FONT_API','PcfFontFile._load_bitmaps oversized PCF glyph','PCF font'],
  ['GHSA-9hw9-ch79-4vh6','12.3.0','NATIVE_CMS','ImageCmsTransform.apply output image mode mismatch','caller-configured CMS transform'],
  ['GHSA-fj7v-r99m-22gq','12.3.0','ENCODER_API','TGA RLE save of 1-bit image causes buffer overread','TGA encoder (not input decoder)'],
  ['GHSA-jjj6-mw9f-p565','12.3.0','PDF_API','PdfParser.PdfStream.decode unbounded FlateDecode output','PDF stream parser'],
  ['GHSA-phj9-mv4w-65pm','12.3.0','OTHER_PLUGIN','GdImageFile.open and large GD dimensions','GD image plugin (not generic Image.open)'],
  ['GHSA-r73j-pqj5-w3x7','12.2.0','PDF_API','PdfParser trailer Prev offset cycle','PDF trailer parser'],
  ['GHSA-vjc4-5qp5-m44j','12.3.0','OTHER_CODEC','JPEG2000 tiled decoder accumulation of scratch buffer','JPEG2000 JP2/J2K (not JPEG)'],
  ['GHSA-wjx4-4jcj-g98j','12.2.0','FONT_API','glyph advance overflow in font rendering','font advance metrics'],
  ['GHSA-xj96-63gp-2gmr','12.3.0','FILTER_API','ImageFilter.RankFilter with huge odd filter size','caller-configured image filter']
];
const CATEGORY_SET=new Set([
 'SPECIALIZED_API','NATIVE_CMS','FONT_API','DISPLAY_API','OTHER_CODEC',
 'PIXEL_OPERATION','ENCODER_API','PDF_API','OTHER_PLUGIN','FILTER_API'
]);
function checkAppEntry(server,worker){
 need(typeof server==='string'&&typeof worker==='string','source type');
 const sniff=server.split('function sniffImage(bytes) {')[1]?.split('\nfunction reply(')[0];
 need(typeof sniff==='string','sniffImage function missing');
 for(const mime of ['image/png','image/jpeg','image/webp'])
   need(sniff.includes("mime: '"+mime+"'"),'expected signature missing '+mime);
 need((sniff.match(/mime: 'image\//g)||[]).length===3,
   'new MIME signatures require new review');
 need(sniff.includes("bytes.subarray(0, 8).equals")&&sniff.includes('RIFF')&&sniff.includes('WEBP')
   &&sniff.includes('bytes[0] === 255')&&sniff.includes('bytes[1] === 216'),
   'signature guards changed');
 need(server.includes('const MAX_IMAGE_BYTES = 8 * 1024 * 1024;')&&
   server.includes('imageInfo = sniffImage(image);')&&
   server.includes('payload.image.mime !== imageInfo.mime')&&
   server.includes('image.length > MAX_IMAGE_BYTES'),
   'upload byte and MIME guards changed');
 need(worker.includes('Image.MAX_IMAGE_PIXELS = 16_000_000')&&
   worker.includes('with Image.open(image) as src:')&&
   worker.includes('src.load()')&&worker.includes('ImageOps.exif_transpose(src)')&&
   worker.includes('or width * height > 16_000_000')&&
   worker.includes('picture = oriented.convert("RGB")'),
   'Pillow decode/preprocess pathway changed');
 need(worker.includes('if image.parent != job_dir or image.name not in ("input.png", "input.jpg", "input.webp")'),
   'worker job image allowlist changed');
 return {
   submittedPayloadLimitBytes:8388608,
   signatureAndDeclaredMimeMustAgree:true,
   admittedTopLevelImageMimeTypes:['image/jpeg','image/png','image/webp'],
   validatedWholeFileCodecContentBeforePillow:false,
   imageLoadAndExifProcessingDirectlyActive:true,
   declaredPixelLimit:16000000,
   OSNativeParserConfinementVerified:false,
   alternateFormatsProvenUniversallyUnreachable:false
 };
}
export function buildPillowFormatTriage(full,prior,server,worker,shas){
 need(shas&&['full','prior','server','worker'].every(k=>shaOK(shas[k])),
   'source SHA invalid');
 need(full?.schema==='local3d.g3.23.full-public-osv-advisory-alias-census.v1'
   &&full.newFullPublicVersionResultCount===104&&full.newAliasLinkedPublicRecordGroupCount===64
   &&full.securityIssue4Resolved===false&&full.newGPUInference===false
   &&full.unsafePackageVulnerabilitiesProvenResolved===false,
   'G3.23 source or security semantics changed');
 need(prior?.schema==='local3d.g3.24.security-review-queue-not-remediation.v1'
   &&prior.previousFullG323EvidenceSha256===shas.full
   &&prior.fullPublicRecordsAccountedFor===104&&prior.publicAliasGroupsAccountedFor===64
   &&prior.securityIssue4Resolved===false&&prior.newUntrustedInputsAuthorized===false
   &&prior.packagesInstalled===0&&prior.printQualified===false
   &&prior.GPUInferenceRuns===0,
   'G3.24 source lineage or safety semantics changed');
 const entry=checkAppEntry(server,worker);
 const all=full.allPublicVersionMatchingAdvisoryRecords;
 const rows=all.filter(x=>x.packageName==='Pillow');
 const groups=prior.queue.filter(x=>x.affectedPublicPackageNames?.includes('Pillow'));
 need(all.length===104&&rows.length===32&&groups.length===16&&cases.length===16,
   'expected exact records/group counts changed');
 const index=new Map(rows.map(x=>[x.advisoryId,x]));
 need(index.size===32,'duplicate Pillow advisories');
 const caseIndex=new Map(cases.map(c=>[c[0],c]));
 need(caseIndex.size===16,'duplicate manually reviewed GHSA conditions');
 const seen=new Set();
 const reviewed=groups.map(g=>{
   need(g.reviewTier==='REVIEW_FIRST_REAL_IMAGE_DECODER'&&
      g.perAdvisoryTriggerReachability==='UNKNOWN_NEEDS_MANUAL_TRIAGE'&&
      g.actualExploitableApplicationBugConfirmed===false&&
      g.productionPatchedOrSecure===false,
      'review queue must stay unresolved');
   const ids=g.sortedAliasGroupRecordIds;
   need(Array.isArray(ids)&&ids.length===2,'Pillow group membership changed');
   const ghsa=ids.find(x=>x.startsWith('GHSA-'));
   need(typeof ghsa==='string'&&caseIndex.has(ghsa),'unknown GHSA group');
   const [_,fixed,category,condition,surface]=caseIndex.get(ghsa);
   need(CATEGORY_SET.has(category)&&condition.length>8,'invalid reviewed category');
   for(const id of ids){
     need(!seen.has(id)&&index.has(id),'duplicate/unknown Pillow record');
     seen.add(id);
     const record=index.get(id);
     need(record.publicVersionQueried==='10.1.0'
       &&record.status==='VERSION_MATCH_NOT_CONFIRMED_EXPLOIT_OR_FIXED'
       &&record.appCodePathReachability==='UNASSESSED_PER_ADVISORY'
       &&record.publicAffectedRangeFixedEvents.includes(fixed),
       'historical version or upstream fixed range changed');
   }
   need(ids.some(id=>id.startsWith('PYSEC-')),'expected public PYSEC companion absent');
   return {
     reviewedGHSAId:ghsa,
     sourceUrl:'https://github.com/advisories/'+ghsa,
     publicOsVRecordIds:[...ids],
     publiclyListedFirstFixedVersion:fixed,
     upstreamNamedTrigger:condition,
     upstreamFormatOrAPISurface:surface,
     triggerClass:category,
     standardPNGJPEGWebPEntryPathIsNotProofOfSpecificTrigger:true,
     ordinaryDirectUploadMatchesNamedAlternateCodec:
       category==='OTHER_CODEC'?false:null,
     firstPartyDirectCallToNamedTriggerEstablished:false,
     nativeOrTransitiveApplicability:'UNKNOWN_NOT_AUDITED_END_TO_END',
     appExploitabilityStatus:'UNRESOLVED_STATIC_SOURCE_REVIEW_ONLY',
     patchedProductionVerified:false
   };
 }).sort((a,b)=>a.reviewedGHSAId.localeCompare(b.reviewedGHSAId));
 need(seen.size===32&&[...index.keys()].every(x=>seen.has(x)),'Pillow coverage incomplete');
 need(reviewed.filter(x=>x.triggerClass==='OTHER_CODEC').length===2,
   'two current non-allowlisted image codec cases expected');
 return {
   schema:'local3d.g3.25.pillow-format-and-api-triage-not-clearance.v1',
   reviewDate:'2026-10-10',
   inheritedOSVSnapshotDatetime:full.queriedAt,
   parentG323Sha256:shas.full,
   parentG324Sha256:shas.prior,
   inputSourceNodeSha256:shas.server,
   inputSourcePythonSha256:shas.worker,
   publicPillowRecordsAccountedFor:seen.size,
   aliasLinkedPillowGroupsReviewed:reviewed.length,
   upstreamDescriptionsManuallySummarizedFromOfficialGHSA:true,
   officialDescriptionsNotRuntimeExploitProof:true,
   sourceReviewBoundedToServerAndWorkerEntrypoints:true,
   actualInputPath:entry,
   pillowReviewCases:reviewed,
   perAdvisoryActualReachabilityCertified:0,
   formatWhitelistAloneMakesNativeParsersSafe:false,
   livePillowVersion:'10.1.0',
   productionDependenciesModified:false,
   g3ShadowPillow12_3DoesNotUpgradeProduction:true,
   vulnerabilityRemediationCompleted:false,
   securityIssue4Resolved:false,
   manufacturingIssue3Resolved:false,
   OSRestrictionsModified:false,
   newUntrustedUserFilesApproved:false,
   modelExecutions:0,
   GPUInferenceRuns:0,
   printQualified:false,
   approvedForPrinter:false,
   fabricationAction:'NONE'
 };
}
